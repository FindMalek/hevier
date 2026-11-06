package expo.modules.homewidgets

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import org.json.JSONObject
import java.util.Calendar

// A redraw just after midnight, or at the next Recovery colour change if
// that's sooner. Not a wake-up alarm: a sleeping phone redraws when it's
// next woken, which is when the widgets are seen.
object RedrawScheduler {
  fun bookNext(context: Context, data: JSONObject?) {
    val next = Calendar.getInstance().apply {
      add(Calendar.DAY_OF_MONTH, 1)
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 5)
      set(Calendar.MILLISECOND, 0)
    }
    val intent = PendingIntent.getBroadcast(
      context,
      0,
      Intent(context, MidnightReceiver::class.java),
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )
    val at = minOf(next.timeInMillis, nextStep(data)?.let { it + 5_000 } ?: Long.MAX_VALUE)
    (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).set(AlarmManager.RTC, at, intent)
  }

  // The first Recovery step still to come, epoch ms, or null.
  private fun nextStep(data: JSONObject?): Long? {
    val steps = data?.optJSONArray("recovery") ?: return null
    val now = System.currentTimeMillis()
    for (i in 0 until steps.length()) {
      val at = steps.getJSONObject(i).optLong("at")
      if (at > now) return at
    }
    return null
  }
}
