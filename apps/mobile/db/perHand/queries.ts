// SQL for dumbbell weight per hand.

// Every dumbbell exercise, to pick the ones that get the switch.
export const SELECT_DUMBBELL_EXERCISES = `
  SELECT id, name, equipment
  FROM exercises
  WHERE equipment = 'dumbbell'`;
