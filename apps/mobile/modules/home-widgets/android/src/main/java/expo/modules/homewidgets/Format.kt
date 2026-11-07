package expo.modules.homewidgets

import java.util.Calendar
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToLong

// Text the widgets show or look up.
object Format {
  // Same as shortVolumeLabel in lib/format/weight.ts (and its constants in
  // constants/weight.ts): "800 kg" below 1,000 kg, then "19k kg".
  private const val SHORT_VOLUME_FROM_KG = 1000
  private const val KG_PER_THOUSAND = 1000

  fun kg(value: Double): String =
    if (abs(value) >= SHORT_VOLUME_FROM_KG) "${(value / KG_PER_THOUSAND).roundToLong()}k kg" else "${value.roundToLong()} kg"

  // "2026-11-06", the app's day keys. month is 1–12.
  fun dayKey(year: Int, month: Int, day: Int) = String.format(Locale.US, "%04d-%02d-%02d", year, month, day)

  fun dayKey(c: Calendar) = dayKey(c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH))
}
