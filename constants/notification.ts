// The workout notification's buttons, by id (hooks/useWorkoutNotification.ts).
// The native side (modules/workout-notification/.../Constants.kt) uses the same
// ids; constants/notification.test.ts checks they match.
export const NOTIFICATION_BUTTON_IDS = {
  complete: 'complete',
  skip: 'skip',
  minus15: 'minus15',
  plus15: 'plus15',
} as const;
