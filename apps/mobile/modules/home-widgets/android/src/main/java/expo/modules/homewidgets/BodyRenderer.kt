package expo.modules.homewidgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import androidx.core.graphics.PathParser
import org.json.JSONObject

// The Recovery widget's front and back bodies, drawn like the app's
// components/MuscleMapBody.tsx: MuscleMap's grey body picture clipped to its
// outline, the coloured muscles painted on at 0.85 with a dark edge. Shapes
// from res/raw/body_paths.json (scripts/widgets/body-paths.mjs).
object BodyRenderer {
  // Both views' bodies fit in here (MuscleMapBody's CROP), in picture units;
  // the picture itself is 1024 x 1536.
  private val CROP = RectF(195f, 60f, 195f + 634f, 60f + 1390f)
  private const val GAP = 0.06f // between front and back, as a share of one body's width

  private class Muscle(val group: String, val path: Path)
  private class Side(val outline: Path, val muscles: List<Muscle>, val photo: Int)

  private var sides: List<Side>? = null

  private fun load(context: Context): List<Side> {
    sides?.let { return it }
    val json = context.resources.openRawResource(R.raw.body_paths).bufferedReader().use { JSONObject(it.readText()) }
    val loaded = listOf("front" to R.drawable.widget_body_front, "back" to R.drawable.widget_body_back).map { (key, photo) ->
      val view = json.getJSONObject(key)
      // Shapes drawn on the left side are mirrored onto the right, as in the app.
      val mirror = Matrix().apply { setScale(-1f, 1f, view.getDouble("centerX").toFloat(), 0f) }
      fun both(side: String, d: String): Path {
        val path = PathParser.createPathFromPathData(d)
        if (side == "LEFT") path.addPath(PathParser.createPathFromPathData(d), mirror)
        return path
      }
      val outline = Path()
      val outlines = view.getJSONArray("outline")
      for (i in 0 until outlines.length()) {
        val o = outlines.getJSONObject(i)
        outline.addPath(both(o.getString("side"), o.getString("d")))
      }
      val list = view.getJSONArray("muscles")
      val muscles = (0 until list.length()).map {
        val m = list.getJSONObject(it)
        Muscle(m.getString("group"), both(m.getString("side"), m.getString("d")))
      }
      Side(outline, muscles, photo)
    }
    sides = loaded
    return loaded
  }

  // Front and back side by side, `height` px tall; muscles not in `colors` stay grey.
  fun render(context: Context, colors: Map<String, Int>, height: Int): Bitmap {
    val all = load(context)
    val scale = height / CROP.height()
    val bodyWidth = CROP.width() * scale
    val gap = bodyWidth * GAP
    val bitmap = Bitmap.createBitmap((bodyWidth * 2 + gap).toInt(), height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    val edge = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      color = Color.argb(140, 0, 0, 0)
      strokeWidth = 1.2f
    }
    val photoPaint = Paint(Paint.FILTER_BITMAP_FLAG)
    all.forEachIndexed { i, side ->
      canvas.save()
      canvas.translate(i * (bodyWidth + gap), 0f)
      canvas.scale(scale, scale)
      canvas.translate(-CROP.left, -CROP.top)
      canvas.save()
      canvas.clipPath(side.outline)
      // Half size is plenty for a widget, and a quarter of the memory.
      val photo = BitmapFactory.decodeResource(context.resources, side.photo, BitmapFactory.Options().apply { inSampleSize = 2 })
      canvas.drawBitmap(photo, null, RectF(0f, 0f, 1024f, 1536f), photoPaint)
      photo.recycle()
      canvas.restore()
      for (m in side.muscles) {
        val color = colors[m.group] ?: continue
        fill.color = color
        fill.alpha = (0.85f * 255).toInt()
        canvas.drawPath(m.path, fill)
        canvas.drawPath(m.path, edge)
      }
      canvas.restore()
    }
    return bitmap
  }
}
