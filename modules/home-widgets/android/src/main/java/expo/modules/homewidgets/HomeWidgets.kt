package expo.modules.homewidgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri

// The home-screen widgets. The app sends the data (workout days, kg per day,
// the next cycle routine, the Recovery colours ahead of time); "today", "this
// week" and the current Recovery colours are worked out here at each redraw,
// and a redraw is booked for midnight or the next colour change, whichever
// comes first, so they move on with the app closed.
// Each widget's drawing is in its *View.kt file.
object HomeWidgets {
  private val PROVIDERS = listOf(
    CalendarWidget::class.java,
    VolumeWidget::class.java,
    CycleWidget::class.java,
    RecoveryWidget::class.java
  )

  fun redrawAll(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    for (provider in PROVIDERS) {
      val ids = manager.getAppWidgetIds(ComponentName(context, provider))
      if (ids.isNotEmpty()) redraw(context, manager, provider, ids)
    }
    RedrawScheduler.bookNext(context, WidgetStore.load(context))
  }

  fun redraw(context: Context, manager: AppWidgetManager, provider: Class<out AppWidgetProvider>, ids: IntArray) {
    val data = WidgetStore.load(context)
    val views = when (provider) {
      CalendarWidget::class.java -> CalendarView.build(context, data)
      VolumeWidget::class.java -> VolumeView.build(context, data)
      RecoveryWidget::class.java -> RecoveryView.build(context, data)
      else -> CycleView.build(context, data)
    }
    manager.updateAppWidget(ids, views)
  }

  // Tapping a widget opens this app link.
  fun open(context: Context, uri: String, code: Int): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uri))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(context, code, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }
}
