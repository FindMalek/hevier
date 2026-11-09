package expo.modules.workoutnotification

// The workout notification's fixed values, in one place.
object NotificationConstants {
  // Log tag for every file in this module.
  const val TAG = "WorkoutNotification"

  // "workout" was the first channel, at low importance (in the Silent group, folded).
  const val CHANNEL_ID = "workout_in_progress"
  const val LEGACY_CHANNEL_ID = "workout"
  const val NOTIFICATION_ID = 4711

  // The buttons, by id. The app sends and gets the same ids:
  // NOTIFICATION_BUTTON_IDS in constants/notification.ts (a test checks they match).
  const val BUTTON_COMPLETE = "complete"
  const val BUTTON_SKIP = "skip"
  const val BUTTON_MINUS_15 = "minus15"
  const val BUTTON_PLUS_15 = "plus15"

  // Tapping the notification opens Log Workout.
  const val LOG_WORKOUT_LINK = "hevier://log-workout"

  // Redraws at most this often.
  const val MIN_REDRAW_MS = 250L
  // A rest end time sent to JS this recently and echoed back is a stale echo.
  const val ECHO_WINDOW_MS = 3000L
  // Nothing is redrawn for this long after a button tap: a tap landing during a
  // redraw misses the button and opens the app instead.
  const val QUIET_AFTER_TAP_MS = 700L
  // Rest end times remembered to spot echoes.
  const val SENT_RESTS_MAX = 50

  // -15s / +15s.
  const val REST_STEP_SECONDS = 15
  // -15s that leaves less than this ends the rest, like Skip.
  const val REST_END_TOLERANCE_MS = 500L

  // The rest bar's scale (0 to this).
  const val PROGRESS_MAX = 1000
  // While resting the phone stays awake until the rest ends, plus this.
  const val WAKE_LOCK_MARGIN_MS = 5000L
  // The once-a-second redraw lands just after each second turns.
  const val TICK_OFFSET_MS = 20L

  // Rest over: two buzzes (off, on, off, on in ms).
  val REST_OVER_BUZZ = longArrayOf(0, 350, 150, 350)

  // Each button's PendingIntent request code is this plus its place.
  const val ACTION_REQUEST_CODE_BASE = 100
  // The exercise still, drawn as a circle this many pixels across.
  const val PICTURE_SIZE_PX = 160
}
