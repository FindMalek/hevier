package expo.modules.homewidgets

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// JS hands the widgets their data (modules/home-widgets/index.ts): kept in
// SharedPreferences, then every placed widget is redrawn.
class HomeWidgetsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HomeWidgets")

    Function("update") { json: String ->
      val context = appContext.reactContext ?: return@Function
      WidgetStore.save(context, json)
      HomeWidgets.redrawAll(context)
    }
  }
}
