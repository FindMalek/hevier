package expo.modules.homewidgets

import android.content.Context
import android.graphics.Color
import android.widget.RemoteViews
import org.json.JSONObject

// Front and back, coloured like Statistics → Recovery right now: the last
// step the app sent that has started (grey when there is none).
object RecoveryView {
  fun build(context: Context, data: JSONObject?): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_recovery)
    val now = System.currentTimeMillis()
    var colors: JSONObject? = null
    data?.optJSONArray("recovery")?.let { steps ->
      for (i in 0 until steps.length()) {
        val step = steps.getJSONObject(i)
        if (step.optLong("at") <= now) colors = step.optJSONObject("colors")
      }
    }
    val byGroup = HashMap<String, Int>()
    colors?.let { c -> c.keys().forEach { byGroup[it] = Color.parseColor(c.getString(it)) } }
    val height = (context.resources.displayMetrics.density * 150).toInt()
    views.setImageViewBitmap(R.id.rec_body, BodyRenderer.render(context, byGroup, height))
    views.setOnClickPendingIntent(R.id.rec_root, HomeWidgets.open(context, "hevier://statistics", 4))
    return views
  }
}
