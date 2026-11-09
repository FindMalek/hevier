package expo.modules.workoutnotification

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import expo.modules.workoutnotification.NotificationConstants.REST_OVER_BUZZ
import expo.modules.workoutnotification.NotificationConstants.TAG

// The end of a rest: keeps the phone awake until then, then buzzes and chimes.
class RestAlert(private val context: Context) {
  private var wakeLock: PowerManager.WakeLock? = null

  // With the screen off Android could sleep through the end of the rest.
  fun holdWakeLock(ms: Long) {
    val lock = wakeLock ?: context.getSystemService(PowerManager::class.java)
      .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Hevier:rest")
      .apply { setReferenceCounted(false) }
      .also { wakeLock = it }
    lock.acquire(ms)
  }

  fun releaseWakeLock() {
    wakeLock?.let { if (it.isHeld) it.release() }
  }

  // Two strong pulses, felt with the phone in a pocket, and the PR chime
  // (res/raw/rest_chime.wav = assets/sounds/pr.wav) on the notification
  // volume, so silent mode keeps it quiet. Music is lowered, not stopped.
  fun restOver() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    Log.i(TAG, "rest over: buzz and chime")
    try {
      val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        context.getSystemService(VibratorManager::class.java).defaultVibrator
      } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
      }
      vibrator.vibrate(VibrationEffect.createWaveform(REST_OVER_BUZZ, -1))
    } catch (e: Exception) {
      Log.w(TAG, "rest buzz failed", e)
    }
    try {
      val attributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      val audio = context.getSystemService(AudioManager::class.java)
      val focus = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
        .setAudioAttributes(attributes)
        .build()
      audio.requestAudioFocus(focus)
      val player = MediaPlayer.create(context, R.raw.rest_chime, attributes, audio.generateAudioSessionId())
      player.setOnCompletionListener {
        it.release()
        audio.abandonAudioFocusRequest(focus)
      }
      player.start()
    } catch (e: Exception) {
      Log.w(TAG, "rest chime failed", e)
    }
  }
}
