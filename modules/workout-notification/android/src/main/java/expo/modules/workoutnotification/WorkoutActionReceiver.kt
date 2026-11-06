package expo.modules.workoutnotification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

// A button on the workout notification. The rest buttons act in the service
// first (see RestController); JS gets the id, plus the new rest for those.
class WorkoutActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getStringExtra(EXTRA_ID) ?: return
    if (!RestController.isRestButton(id)) {
      WorkoutNotificationModule.emitAction(id, null)
      return
    }
    val rest = WorkoutNotificationService.restButton(id) ?: return
    WorkoutNotificationModule.emitAction(id, rest)
  }

  companion object {
    const val ACTION = "expo.modules.workoutnotification.ACTION"
    const val EXTRA_ID = "id"
  }
}
