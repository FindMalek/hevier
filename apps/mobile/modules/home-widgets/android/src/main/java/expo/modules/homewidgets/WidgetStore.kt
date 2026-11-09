package expo.modules.homewidgets

import android.content.Context
import org.json.JSONObject

// The data the app last sent, kept in SharedPreferences for the widgets.
object WidgetStore {
  private const val PREFS = "hevier_widgets"
  private const val KEY = "data"

  fun save(context: Context, json: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply()
  }

  fun load(context: Context): JSONObject? =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null)?.let {
      try {
        JSONObject(it)
      } catch (e: Exception) {
        null
      }
    }
}
