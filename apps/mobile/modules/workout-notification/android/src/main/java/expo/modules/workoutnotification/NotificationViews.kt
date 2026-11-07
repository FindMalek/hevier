package expo.modules.workoutnotification

import android.app.Notification
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.net.Uri
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import expo.modules.workoutnotification.NotificationConstants.ACTION_REQUEST_CODE_BASE
import expo.modules.workoutnotification.NotificationConstants.CHANNEL_ID
import expo.modules.workoutnotification.NotificationConstants.LOG_WORKOUT_LINK
import expo.modules.workoutnotification.NotificationConstants.PICTURE_SIZE_PX
import expo.modules.workoutnotification.NotificationConstants.PROGRESS_MAX

// Builds the notification from a WorkoutState: the layout, picture and buttons.
class NotificationViews(private val context: Context) {
  private var imageUri: String? = null
  private var imageBitmap: Bitmap? = null

  fun build(s: WorkoutState): Notification {
    val now = System.currentTimeMillis()
    val restLeftMs = s.restEndsAt?.let { it - now } ?: 0
    val resting = restLeftMs > 0
    val views = RemoteViews(context.packageName, R.layout.workout_notification)
    views.setTextViewText(R.id.title, s.title)
    views.setTextViewText(R.id.text, if (resting) s.restText else s.setText)
    views.setViewVisibility(R.id.rest_row, if (resting) View.VISIBLE else View.GONE)
    if (resting) {
      views.setChronometer(R.id.rest_label, SystemClock.elapsedRealtime() + restLeftMs, "Rest %s", true)
      views.setChronometerCountDown(R.id.rest_label, true)
      views.setProgressBar(R.id.rest_progress, PROGRESS_MAX, RestController.progress(s, now), false)
    }
    val picture = picture(s.image)
    if (picture != null) views.setImageViewBitmap(R.id.image, picture)
    views.setViewVisibility(R.id.image, if (picture != null) View.VISIBLE else View.GONE)

    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_workout_notification)
      .setStyle(NotificationCompat.DecoratedCustomViewStyle())
      .setCustomContentView(views)
      .setCustomBigContentView(views)
      .setContentTitle(s.title)
      .setContentText(if (resting) s.restText else s.setText)
      .setContentIntent(openLogWorkout())
      .setWhen(s.postedAt)
      .setShowWhen(true)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_WORKOUT)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
    (if (resting) s.restButtons else s.setButtons).forEachIndexed { i, (id, label) ->
      builder.addAction(0, label, actionIntent(i, id))
    }
    return builder.build()
  }

  private fun openLogWorkout(): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(LOG_WORKOUT_LINK))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    return PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  private fun actionIntent(index: Int, id: String): PendingIntent {
    val intent = Intent(context, WorkoutActionReceiver::class.java)
      .setAction(WorkoutActionReceiver.ACTION)
      .putExtra(WorkoutActionReceiver.EXTRA_ID, id)
    return PendingIntent.getBroadcast(context, ACTION_REQUEST_CODE_BASE + index, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  // The exercise still as a white circle, as in the app's lists. Decoded once per exercise.
  private fun picture(uri: String?): Bitmap? {
    if (uri == imageUri) return imageBitmap
    imageUri = uri
    imageBitmap = uri?.let { Uri.parse(it).path }?.let { BitmapFactory.decodeFile(it) }?.let { circle(it) }
    return imageBitmap
  }

  private fun circle(source: Bitmap): Bitmap {
    val size = PICTURE_SIZE_PX
    val out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(out)
    val clip = Path().apply { addCircle(size / 2f, size / 2f, size / 2f, Path.Direction.CW) }
    canvas.clipPath(clip)
    canvas.drawColor(Color.WHITE)
    val scale = maxOf(size.toFloat() / source.width, size.toFloat() / source.height)
    val w = source.width * scale
    val h = source.height * scale
    canvas.drawBitmap(
      source,
      null,
      RectF((size - w) / 2, (size - h) / 2, (size + w) / 2, (size + h) / 2),
      Paint(Paint.FILTER_BITMAP_FLAG)
    )
    return out
  }
}
