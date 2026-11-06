package expo.modules.homewidgets

import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject

// The next routine in the cycle, with its exercises.
object CycleView {
  fun build(context: Context, data: JSONObject?): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_cycle)
    val cycle = data?.optJSONObject("cycle")
    if (cycle != null) {
      views.setTextViewText(R.id.cyc_step, "${cycle.optInt("step")} of ${cycle.optInt("total")}")
      views.setTextViewText(R.id.cyc_name, cycle.optString("name"))
      val exercises = cycle.optJSONArray("exercises")
      val names = (0 until (exercises?.length() ?: 0)).map { exercises!!.getString(it) }
      views.setTextViewText(R.id.cyc_exercises, names.joinToString(", "))
    } else {
      views.setTextViewText(R.id.cyc_step, "")
      views.setTextViewText(R.id.cyc_name, "No cycle set")
      views.setTextViewText(R.id.cyc_exercises, "Set one in Workout → Cycle")
    }
    views.setOnClickPendingIntent(R.id.cyc_root, HomeWidgets.open(context, "hevier://", 3))
    return views
  }
}
