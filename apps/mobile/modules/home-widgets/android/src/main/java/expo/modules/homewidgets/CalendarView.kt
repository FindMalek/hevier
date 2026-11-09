package expo.modules.homewidgets

import android.content.Context
import android.graphics.Typeface
import android.text.SpannableString
import android.text.style.StyleSpan
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.DateFormatSymbols
import java.util.Calendar
import java.util.Locale

// This month, Monday first: workout days on a blue disc, today in blue
// (a white ring on the disc when today has a workout).
object CalendarView {
  private val DAY_IDS = intArrayOf(
    R.id.cal_day_0, R.id.cal_day_1, R.id.cal_day_2, R.id.cal_day_3, R.id.cal_day_4, R.id.cal_day_5, R.id.cal_day_6,
    R.id.cal_day_7, R.id.cal_day_8, R.id.cal_day_9, R.id.cal_day_10, R.id.cal_day_11, R.id.cal_day_12, R.id.cal_day_13,
    R.id.cal_day_14, R.id.cal_day_15, R.id.cal_day_16, R.id.cal_day_17, R.id.cal_day_18, R.id.cal_day_19, R.id.cal_day_20,
    R.id.cal_day_21, R.id.cal_day_22, R.id.cal_day_23, R.id.cal_day_24, R.id.cal_day_25, R.id.cal_day_26, R.id.cal_day_27,
    R.id.cal_day_28, R.id.cal_day_29, R.id.cal_day_30, R.id.cal_day_31, R.id.cal_day_32, R.id.cal_day_33, R.id.cal_day_34,
    R.id.cal_day_35, R.id.cal_day_36, R.id.cal_day_37, R.id.cal_day_38, R.id.cal_day_39, R.id.cal_day_40, R.id.cal_day_41
  )
  private val ROW_IDS = intArrayOf(R.id.cal_row_0, R.id.cal_row_1, R.id.cal_row_2, R.id.cal_row_3, R.id.cal_row_4, R.id.cal_row_5)

  fun build(context: Context, data: JSONObject?): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_calendar)
    val today = Calendar.getInstance()
    val year = today.get(Calendar.YEAR)
    val month = today.get(Calendar.MONTH)
    val days = HashSet<String>()
    data?.optJSONArray("days")?.let { for (i in 0 until it.length()) days.add(it.getString(i)) }

    views.setTextViewText(R.id.cal_title, DateFormatSymbols(Locale.ENGLISH).months[month])
    val first = Calendar.getInstance().apply {
      clear()
      set(year, month, 1)
    }
    val offset = (first.get(Calendar.DAY_OF_WEEK) + 5) % 7 // Monday = 0
    val length = first.getActualMaximum(Calendar.DAY_OF_MONTH)
    for (cell in DAY_IDS.indices) {
      val id = DAY_IDS[cell]
      val day = cell - offset + 1
      if (day < 1 || day > length) {
        views.setTextViewText(id, "")
        views.setInt(id, "setBackgroundResource", 0)
        continue
      }
      val trained = days.contains(Format.dayKey(year, month + 1, day))
      val isToday = day == today.get(Calendar.DAY_OF_MONTH)
      val label = SpannableString(day.toString())
      if (trained) label.setSpan(StyleSpan(Typeface.BOLD), 0, label.length, 0)
      views.setTextViewText(id, label)
      views.setTextColor(id, context.getColor(if (isToday && !trained) R.color.widget_primary else R.color.widget_text))
      views.setInt(
        id,
        "setBackgroundResource",
        when {
          trained && isToday -> R.drawable.widget_day_today_workout
          trained -> R.drawable.widget_day_workout
          else -> 0
        }
      )
    }
    // Five rows unless the month spills into a sixth week.
    val rows = (offset + length + 6) / 7
    for (r in ROW_IDS.indices) views.setViewVisibility(ROW_IDS[r], if (r < rows) View.VISIBLE else View.GONE)
    views.setOnClickPendingIntent(R.id.cal_root, HomeWidgets.open(context, "hevier://calendar", 1))
    return views
  }
}
