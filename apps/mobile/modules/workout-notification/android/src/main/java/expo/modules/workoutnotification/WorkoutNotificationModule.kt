package expo.modules.workoutnotification

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

// The workout notification, driven from JS (components/useWorkoutNotification.ts):
// show() with what to say and which buttons to offer, hide() when the workout
// ends. A button press comes back as an onAction event with the button's id.

class NotificationButton : Record {
  @Field val id: String = ""
  @Field val label: String = ""
}

class ShowOptions : Record {
  @Field val title: String = ""
  @Field val setText: String = ""
  @Field val restText: String = ""
  @Field val restEndsAt: Double? = null // epoch ms
  @Field val restTotal: Double? = null // seconds
  @Field val image: String? = null // file:// uri of the exercise still
  @Field val setButtons: List<NotificationButton> = emptyList()
  @Field val restButtons: List<NotificationButton> = emptyList()
}

class WorkoutNotificationModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("WorkoutNotification")
    Events("onAction")

    OnCreate { instance = this@WorkoutNotificationModule }
    OnDestroy { if (instance === this@WorkoutNotificationModule) instance = null }

    Function("show") { options: ShowOptions ->
      WorkoutNotificationService.show(
        context.applicationContext,
        WorkoutState(
          title = options.title,
          setText = options.setText,
          restText = options.restText,
          restEndsAt = options.restEndsAt?.toLong(),
          restTotal = options.restTotal?.toLong(),
          image = options.image,
          setButtons = options.setButtons.map { it.id to it.label },
          restButtons = options.restButtons.map { it.id to it.label },
        )
      )
    }

    Function("hide") {
      WorkoutNotificationService.hide(context.applicationContext)
    }
  }

  companion object {
    @Volatile private var instance: WorkoutNotificationModule? = null

    // From WorkoutActionReceiver; rest = the new rest end (ms) and length (s)
    // for Skip / -15s / +15s. Lost if the app's JS isn't running.
    fun emitAction(id: String, rest: Pair<Long?, Long?>?) {
      val event = mutableMapOf<String, Any?>("id" to id)
      if (rest != null) {
        event["restEndsAt"] = rest.first?.toDouble()
        event["restTotal"] = rest.second?.toDouble()
      }
      instance?.sendEvent("onAction", event)
    }
  }
}
