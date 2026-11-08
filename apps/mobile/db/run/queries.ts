// SQL for the run readiness: the morning check-in and the feedback on a run.

export const SELECT_CHECK_IN = `
  SELECT date, feel, sleep_hours, legs_sore, pain, sick
  FROM run_checkins
  WHERE date = ?`;

// One check-in per day: saving again replaces it.
export const UPSERT_CHECK_IN = `
  INSERT INTO run_checkins (date, feel, sleep_hours, legs_sore, pain, sick, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(date) DO UPDATE SET
    feel = excluded.feel, sleep_hours = excluded.sleep_hours,
    legs_sore = excluded.legs_sore, pain = excluded.pain, sick = excluded.sick`;

// What was shown before a run, and how the legs felt after; saving again replaces it.
export const UPSERT_RUN_FEEDBACK = `
  INSERT INTO run_feedback (workout_id, verdict_shown, legs_felt)
  VALUES (?, ?, ?)
  ON CONFLICT(workout_id) DO UPDATE SET verdict_shown = excluded.verdict_shown, legs_felt = excluded.legs_felt`;

export const DELETE_RUN_FEEDBACK = 'DELETE FROM run_feedback WHERE workout_id = ?';
