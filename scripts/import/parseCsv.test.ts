import { describe, it, expect } from 'vitest';
import type { CsvRow } from '@/types/import';
import { parseCsvText, transformRows } from './parseCsv';

const HEADER =
  'title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe';

const IMPERIAL_HEADER = HEADER.replace('weight_kg', 'weight_lbs').replace('distance_km', 'distance_miles');

describe('parseCsvText', () => {
  it('converts an imperial export (lbs, miles) to kg and km', () => {
    const text = `${IMPERIAL_HEADER}
"RUN","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","","Running",,"",0,"normal",,,3,1800,
"UPPER","Oct 14, 2026, 6:44 PM","Oct 14, 2026, 7:28 PM","","Bench Press",,"",0,"normal",135,5,,,`;
    const [run, bench] = parseCsvText(text).rows;
    expect(run.distance_km).toBe('4.828');
    expect(bench.weight_kg).toBe('61.235');
  });

  it('names the missing columns instead of crashing on a row', () => {
    expect(() => parseCsvText('title,start_time\n"A","Oct 1, 2026, 6:00 PM"')).toThrow(/missing columns: .*exercise_title/);
  });

  it('reads a file that starts with a byte order mark', () => {
    const text = `\uFEFF${HEADER}\n"LOWER B","Oct 13, 2026, 6:44 PM","","","Squat (Machine)",,"",0,"normal",120,10,,,`;
    expect(parseCsvText(text).rows.map((row) => row.title)).toEqual(['LOWER B']);
  });

  it('skips a line with too many or too few fields instead of shifting its values', () => {
    const text = `${HEADER}
"A","Oct 13, 2026, 6:44 PM","",Deload, cardio,"Bench",,"",0,"normal",120,10,,,
"B","Oct 13, 2026, 6:44 PM","","","Bench",,"",0,"normal",100,10,,,
"C","Oct 13, 2026, 6:44 PM","","","Bench",,"",0`;
    const { rows, skipped } = parseCsvText(text);
    expect(rows.map((row) => [row.title, row.rowNumber])).toEqual([['B', 2]]);
    expect(skipped).toEqual([
      { row: 1, reason: 'Expected 14 fields, got 15' },
      { row: 3, reason: 'Expected 14 fields, got 8' },
    ]);
  });

  it('does not count a whitespace-only line as a skipped row', () => {
    const text = `${HEADER}\n"B","Oct 13, 2026, 6:44 PM","","","Bench",,"",0,"normal",100,10,,,\n   \n`;
    expect(parseCsvText(text).skipped).toEqual([]);
  });

  it('refuses repeated column names instead of letting the last one win', () => {
    expect(() => parseCsvText(`${HEADER},reps\n`)).toThrow('CSV repeats the columns: reps');
  });

  it('says so when the file is semicolon-separated', () => {
    expect(() => parseCsvText(HEADER.replaceAll(',', ';'))).toThrow('semicolon-separated');
  });

  it('has no rows for an empty file', () => {
    expect(parseCsvText('')).toEqual({ rows: [], skipped: [] });
  });

  it('parses quoted fields containing commas as a single field', () => {
    const text = `${HEADER}\n"LOWER B","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","Deload, cardio day","Squat (Machine)",,"",0,"normal",120,10,,,`;
    const { rows } = parseCsvText(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe('Deload, cardio day');
    expect(rows[0].start_time).toBe('Oct 13, 2026, 6:44 PM');
  });

  it('parses multiple rows', () => {
    const text = `${HEADER}
"LOWER B","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","","Squat (Machine)",,"",0,"normal",120,10,,,
"LOWER B","Oct 13, 2026, 6:44 PM","Oct 13, 2026, 7:28 PM","","Squat (Machine)",,"",1,"normal",120,9,,,`;
    const { rows } = parseCsvText(text);
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
    rowNumber: 1,
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

  it('infers distance_duration for an exercise logged with distance only', () => {
    const rows = [row({ exercise_title: 'Walk', weight_kg: '', reps: '', distance_km: '3' })];
    expect(transformRows(rows).exerciseTypes.get('Walk')).toBe('distance_duration');
  });

  it('skips and reports rows with a bad number, a bad date or no data, and keeps the rest', () => {
    const rows = [
      row({ rowNumber: 1, set_index: '0' }),
      row({ rowNumber: 2, set_index: '1', weight_kg: 'heavy' }),
      row({ rowNumber: 3, set_index: '2', start_time: 'last Tuesday' }),
      row({ rowNumber: 4, set_index: '3', reps: '1e999' }),
      row({ rowNumber: 5, set_index: '', reps: '8' }),
      row({ rowNumber: 6, exercise_title: 'Empty', weight_kg: '', reps: '' }),
    ];
    const result = transformRows(rows);
    expect(result.workouts[0].exercises).toHaveLength(1);
    expect(result.workouts[0].exercises[0].sets).toHaveLength(1);
    expect(result.skipped.map((s) => s.row)).toEqual([2, 3, 4, 5, 6]);
  });
});

describe('transformRows (end time)', () => {
  it('skips a row whose end time cannot be read, with the reason', () => {
    const result = transformRows([row({ rowNumber: 4, end_time: 'later' })]);
    expect(result.workouts).toEqual([]);
    expect(result.skipped).toEqual([{ row: 4, reason: 'Could not parse date: "later"' }]);
  });
});

describe('dates', () => {
  const rows = [row({ start_time: 'Oct 13, 2026, 6:44 PM', end_time: 'Oct 13, 2026, 7:28 PM' })];

  it("are read in the given zone, whatever the machine's", () => {
    const paris = transformRows(rows, { timeZone: 'Europe/Paris' }).workouts[0];
    expect([paris.startTime, paris.endTime]).toEqual(['2026-10-13T16:44:00.000Z', '2026-10-13T17:28:00.000Z']);
    expect(transformRows(rows, { timeZone: 'UTC' }).workouts[0].startTime).toBe('2026-10-13T18:44:00.000Z');
  });

  it('follow daylight saving: the same wall time is an hour apart in winter and summer', () => {
    const winter = [row({ start_time: 'Jan 13, 2026, 6:44 PM', end_time: '' })];
    expect(transformRows(winter, { timeZone: 'Europe/Paris' }).workouts[0].startTime).toBe('2026-01-13T17:44:00.000Z');
  });
});
