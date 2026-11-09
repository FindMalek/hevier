package expo.modules.workoutnotification

// What the notification shows, as last sent by JS (rest changed here by the buttons).
data class WorkoutState(
  val title: String,
  val setText: String,
  val restText: String,
  val restEndsAt: Long?,
  val restTotal: Long?,
  val image: String?,
  val setButtons: List<Pair<String, String>>,
  val restButtons: List<Pair<String, String>>,
  val postedAt: Long = System.currentTimeMillis(),
)
