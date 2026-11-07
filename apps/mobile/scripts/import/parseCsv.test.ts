import { describe, it, expect } from 'vitest';
import { parseCsvText, transformRows, type CsvRow } from './parseCsv';

const HEADER =
  'title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe';

describe('parseCsvText', () => {
  it('parses quoted fields containing commas as a single field', () => {
    const text = `${HEADER}\n"LOWER B","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","Deload, cardio day","Squat (Machine)",,"",0,"normal",120,10,,,`;
    const rows = parseCsvText(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe('Deload, cardio day');
    expect(rows[0].start_time).toBe('Oct 13, 2026, 6:44 PM');
  });

  it('parses multiple rows', () => {
    const text = `${HEADER}
"LOWER B","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","","Squat (Machine)",,"",0,"normal",120,10,,,
"LOWER B","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","","Squat (Machine)",,"",1,"normal",120,9,,,`;
    const rows = parseCsvText(text);
    expect(rows).toHaveLength(2);
  });
});

function row(overrides: Partial<CsvRow>): CsvRow {
  return {
    title: 'LOWER B',
    start_time: 'Oct 13, 2026, 6:44 PM',
    end_time: 'Oct 13, 2026, 7:28 PM',
    description: '',
    exercise_title: 'Squat (Machine)',
    superset_id: '',
    exercise_notes: '',
    set_index: '0',
    set_type: 'normal',
    weight_kg: '120',
    reps: '10',
    distance_km: '',
    duration_seconds: '',
    rpe: '',
    ...overrides,
  };
}

describe('transformRows', () => {
  it('groups rows into sessions keyed by (title, start_time), not title alone', () => {
    const rows = [
      row({ title: 'LOWER B', start_time: 'Oct 13, 2026, 6:44 PM' }),
      row({ title: 'LOWER B', start_time: 'Aug 11, 2026, 8:00 PM' }),
    ];
    const result = transformRows(rows);
    expect(result.workouts).toHaveLength(2);
  });

  it('orders exercises within a workout by first appearance and assigns order_index', () => {
    const rows = [
      row({ exercise_title: 'Squat (Machine)', set_index: '0', weight_kg: '120', reps: '10' }),
      row({ exercise_title: 'Squat (Machine)', set_index: '1', weight_kg: '120', reps: '9' }),
      row({ exercise_title: 'Leg Extension (Machine)', set_index: '0', weight_kg: '50', reps: '12' }),
    ];
    const result = transformRows(rows);
    const exercises = result.workouts[0].exercises;
    expect(exercises.map((e) => e.exerciseName)).toEqual(['Squat (Machine)', 'Leg Extension (Machine)']);
    expect(exercises[0].orderIndex).toBe(0);
    expect(exercises[1].orderIndex).toBe(1);
    expect(exercises[0].sets).toHaveLength(2);
  });

  it('converts empty optional numeric fields to null, not 0 or NaN', () => {
    const rows = [row({ exercise_title: 'Pull Up', weight_kg: '', reps: '8', distance_km: '', duration_seconds: '', rpe: '' })];
    const result = transformRows(rows);
    const set = result.workouts[0].exercises[0].sets[0];
    expect(set.weightKg).toBeNull();
    expect(set.reps).toBe(8);
    expect(set.distanceKm).toBeNull();
    expect(set.durationSeconds).toBeNull();
    expect(set.rpe).toBeNull();
  });

  it('infers weight_reps type when weight_kg is ever populated for an exercise', () => {
    const rows = [row({ exercise_title: 'Squat (Machine)', weight_kg: '120', reps: '10' })];
    const result = transformRows(rows);
    expect(result.exerciseTypes.get('Squat (Machine)')).toBe('weight_reps');
  });

  it('infers reps_only type when reps is populated but weight_kg never is', () => {
    const rows = [
      row({ exercise_title: 'Pull Up', weight_kg: '', reps: '8' }),
      row({ exercise_title: 'Pull Up', weight_kg: '', reps: '6' }),
    ];
    const result = transformRows(rows);
    expect(result.exerciseTypes.get('Pull Up')).toBe('reps_only');
  });

  it('infers duration type when only duration_seconds is populated', () => {
    const rows = [row({ exercise_title: 'Warm Up', weight_kg: '', reps: '', duration_seconds: '540' })];
    const result = transformRows(rows);
    expect(result.exerciseTypes.get('Warm Up')).toBe('duration');
  });

  it('infers distance_duration type when both distance_km and duration_seconds are populated', () => {
    const rows = [row({ exercise_title: 'Running', weight_kg: '', reps: '', distance_km: '9.41', duration_seconds: '3600' })];
    const result = transformRows(rows);
    expect(result.exerciseTypes.get('Running')).toBe('distance_duration');
  });

  it('parses Hevy date strings into valid, correctly-ordered ISO timestamps', () => {
    const rows = [row({ start_time: 'Oct 13, 2026, 6:44 PM', end_time: 'Oct 13, 2026, 7:28 PM' })];
    const result = transformRows(rows);
    const workout = result.workouts[0];
    expect(() => new Date(workout.startTime)).not.toThrow();
    expect(Number.isNaN(new Date(workout.startTime).getTime())).toBe(false);
    expect(new Date(workout.endTime!).getTime()).toBeGreaterThan(new Date(workout.startTime).getTime());
  });

  it('maps "failure" and "normal" set_type values through unchanged', () => {
    const rows = [row({ set_type: 'failure' })];
    const result = transformRows(rows);
    expect(result.workouts[0].exercises[0].sets[0].setType).toBe('failure');
  });

  it('keeps warm-up sets, and reads set types Hevier lacks (drop sets) as normal', () => {
    const rows = [row({ set_type: 'warmup', set_index: '0' }), row({ set_type: 'dropset', set_index: '1' })];
    const sets = transformRows(rows).workouts[0].exercises[0].sets;
    expect(sets.map((s) => s.setType)).toEqual(['warmup', 'normal']);
  });
});
