package expo.modules.homewidgets

import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject
import java.util.Calendar

// Σ kg of this week (from Monday) and of last week.
object VolumeView {
  fun build(context: Context, data: JSONObject?): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_volume)
    val perDay = data?.optJSONObject("volume")
    val monday = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, 12) // midday: DST changes can't move the day
      add(Calendar.DAY_OF_MONTH, -((get(Calendar.DAY_OF_WEEK) + 5) % 7))
    }
    fun week(start: Calendar): Double {
      val day = start.clone() as Calendar
      var sum = 0.0
      repeat(7) {
        sum += perDay?.optDouble(Format.dayKey(day), 0.0) ?: 0.0
        day.add(Calendar.DAY_OF_MONTH, 1)
      }
      return sum
    }
    val lastMonday = (monday.clone() as Calendar).apply { add(Calendar.DAY_OF_MONTH, -7) }
    views.setTextViewText(R.id.vol_this, Format.kg(week(monday)))
    views.setTextViewText(R.id.vol_last, Format.kg(week(lastMonday)))
    views.setOnClickPendingIntent(R.id.vol_root, HomeWidgets.open(context, "hevier://profile", 2))
    return views
  }
}
