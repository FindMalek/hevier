// SQL for the Calendar screen.

// Every workout, oldest first, with what the calendar shows.
export const SELECT_WORKOUT_DAYS = `
  SELECT id, title, start_time
  FROM workouts
  ORDER BY start_time`;
