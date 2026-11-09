package expo.modules.workoutnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import expo.modules.workoutnotification.NotificationConstants.CHANNEL_ID
import expo.modules.workoutnotification.NotificationConstants.LEGACY_CHANNEL_ID

// The notification channel (Android 8+).
object Channels {
  fun ensure(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(NotificationManager::class.java)
    manager.deleteNotificationChannel(LEGACY_CHANNEL_ID)
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return
    // Default importance keeps it at the top, unfolded; no sound
    // or buzz on its own updates.
    val channel = NotificationChannel(
      CHANNEL_ID,
      context.getString(R.string.workout_channel_name),
      NotificationManager.IMPORTANCE_DEFAULT
    )
    channel.description = context.getString(R.string.workout_channel_description)
    channel.setSound(null, null)
    channel.enableVibration(false)
    channel.setShowBadge(false)
    manager.createNotificationChannel(channel)
  }
}
