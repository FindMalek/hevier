import { requireOptionalNativeModule, type NativeModule } from 'expo';
import type { ShowOptions, NotificationAction, NotificationEvents } from '@/types/notification';

// Our Android workout notification (android/.../WorkoutNotificationService.kt).
// Missing in builds made before it existed, so every call is optional.

declare class WorkoutNotificationModule extends NativeModule<NotificationEvents> {
  show(options: ShowOptions): void;
  hide(): void;
}

const native = requireOptionalNativeModule<WorkoutNotificationModule>('WorkoutNotification');

export function showWorkoutNotification(options: ShowOptions) {
  native?.show(options);
}

export function hideWorkoutNotification() {
  native?.hide();
}

export function onNotificationAction(listener: (action: NotificationAction) => void): () => void {
  const subscription = native?.addListener('onAction', listener);
  return () => subscription?.remove();
}
