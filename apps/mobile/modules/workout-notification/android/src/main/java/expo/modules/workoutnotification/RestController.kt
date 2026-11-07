package expo.modules.workoutnotification

import expo.modules.workoutnotification.NotificationConstants.BUTTON_MINUS_15
import expo.modules.workoutnotification.NotificationConstants.BUTTON_PLUS_15
import expo.modules.workoutnotification.NotificationConstants.BUTTON_SKIP
import expo.modules.workoutnotification.NotificationConstants.ECHO_WINDOW_MS
import expo.modules.workoutnotification.NotificationConstants.PROGRESS_MAX
import expo.modules.workoutnotification.NotificationConstants.REST_END_TOLERANCE_MS
import expo.modules.workoutnotification.NotificationConstants.REST_STEP_SECONDS
import expo.modules.workoutnotification.NotificationConstants.SENT_RESTS_MAX

// The rest timer's maths: the rest buttons, and JS's late echoes of them.
// No Android calls; the time is passed in.
//
// Skip / -15s / +15s act here at once, so they answer straight away even
// when the app's JS is slow in the background; JS is then told the new end
// time (not "+15" again), so a late message can't add the time twice.
object RestController {
  // When a button was last tapped (the service waits a moment before redrawing).
  @Volatile var lastTap = 0L
    private set

  // Rest end times set here by the buttons, sent to JS, with when; -1 = no rest.
  private var latestRest: Long? = null
  private val sentRests = ArrayDeque<Pair<Long, Long>>()

  fun isRestButton(id: String) = id == BUTTON_SKIP || id == BUTTON_MINUS_15 || id == BUTTON_PLUS_15

  // The state after the button, or null when there was nothing to change.
  fun press(s: WorkoutState, id: String, now: Long): WorkoutState? {
    lastTap = now
    val ends = s.restEndsAt?.takeIf { it > now }
    // A button tapped just as the rest ended: nothing to change.
    if (ends == null && id != BUTTON_SKIP) return null
    var newEnds: Long? = null
    var newTotal: Long? = null
    if (id != BUTTON_SKIP && ends != null) {
      val delta = if (id == BUTTON_PLUS_15) REST_STEP_SECONDS else -REST_STEP_SECONDS
      newEnds = ends + delta * 1000L
      newTotal = ((s.restTotal ?: 0) + delta).coerceAtLeast(1)
      // -15s past zero ends the rest, like Skip (no chime).
      if (newEnds <= now + REST_END_TOLERANCE_MS) {
        newEnds = null
        newTotal = null
      }
    }
    latestRest = newEnds ?: -1
    sentRests.addLast((newEnds ?: -1) to now)
    while (sentRests.size > SENT_RESTS_MAX) sentRests.removeFirst()
    return s.copy(restEndsAt = newEnds, restTotal = newTotal)
  }

  // JS echoes each button back in its next update, maybe after newer taps
  // were already made here: an end time sent a moment ago that isn't the
  // latest is such an echo, so the newer one is kept. Anything else is a
  // change made in the app (a set ticked, the in-app rest bar) and wins.
  fun merge(incoming: WorkoutState, current: WorkoutState?, now: Long): WorkoutState {
    val latest = latestRest ?: return incoming
    val sent = incoming.restEndsAt ?: -1
    val stale = sent != latest && sentRests.any { it.first == sent && now - it.second < ECHO_WINDOW_MS }
    if (stale) return incoming.copy(restEndsAt = current?.restEndsAt, restTotal = current?.restTotal)
    reset()
    return incoming
  }

  fun reset() {
    latestRest = null
    sentRests.clear()
  }

  // The bar, 0–PROGRESS_MAX; the countdown text runs on its own.
  fun progress(s: WorkoutState, now: Long): Int {
    val ends = s.restEndsAt ?: return 0
    val left = ((ends - now + 999) / 1000).coerceAtLeast(0)
    val total = (s.restTotal ?: left).coerceAtLeast(1)
    return (left * PROGRESS_MAX / total).toInt().coerceIn(0, PROGRESS_MAX)
  }
}
