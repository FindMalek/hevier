// The workout notification (modules/workout-notification, lib/workoutNotification.ts).

import type { NOTIFICATION_BUTTON_IDS } from '@/constants/notification';

export type NotificationButtonId = (typeof NOTIFICATION_BUTTON_IDS)[keyof typeof NOTIFICATION_BUTTON_IDS];

export interface NotificationContent {
  title: string;
  setText: string; // "Set 1/2 - 80 kg x 11 reps"
  restText: string; // "Next: Set 2 of 2 (80 kg x 8 reps)"
  restEndsAt: number | null;
  restTotal: number | null;
  catalogueId: string | null;
  // The set "Complete Set" ticks; null when every set is done.
  next: { exerciseKey: string; setKey: string } | null;
}

export interface NotificationButton {
  id: NotificationButtonId;
  label: string;
}

export interface ShowOptions {
  title: string;
  setText: string;
  restText: string;
  restEndsAt: number | null; // epoch ms
  restTotal: number | null; // seconds
  image: string | null; // file:// uri
  setButtons: NotificationButton[];
  restButtons: NotificationButton[];
}

// For Skip / -15s / +15s the notification has already changed the rest, and
// sends the new end (ms, null = rest over) and length (seconds).
export interface NotificationAction {
  id: NotificationButtonId;
  restEndsAt?: number | null;
  restTotal?: number | null;
}

export type NotificationEvents = { onAction: (event: NotificationAction) => void };
