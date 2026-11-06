// SQL for the Add Exercise / Replace Exercise picker.

// Every exercise, A-Z, with how often and when it was last done.
export const SELECT_PICKER_EXERCISES = `
  SELECT e.id, e.name, e.type, e.catalogue_id, e.target_muscle, e.body_part, e.equipment,
         COUNT(w.id) AS times_done, MAX(w.start_time) AS last_done
  FROM exercises e
  LEFT JOIN workout_exercises we ON we.exercise_id = e.id
  LEFT JOIN workouts w ON w.id = we.workout_id
  GROUP BY e.id
  ORDER BY e.name COLLATE NOCASE`;
