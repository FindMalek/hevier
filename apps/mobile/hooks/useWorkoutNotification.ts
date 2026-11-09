import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import {
  hideWorkoutNotification,
  onNotificationAction,
  showWorkoutNotification,
} from '@/modules/workout-notification';
import type { NotificationAction, NotificationButton } from '@/types/notification';
import { NOTIFICATION_BUTTON_LABELS } from '@/constants/labels';
import { NOTIFICATION_BUTTON_IDS } from '@/constants/notification';
import { completeSet, getActiveWorkout, setRest, useActiveWorkoutSelect } from '@/stores/activeWorkoutStore';
import { stillUri } from '@/components/exercises/ExerciseThumb';
import { mediaIdFor } from '@/lib/domain/drawings';
import { currentDrawings } from '@/stores/drawings';
import { perHandOn } from '@/stores/perHand';
import { nextSet, notificationContent, sameNotification } from '@/lib/workoutNotification';
import type { ActiveWorkout } from '@/types/workout';

// The notification while a workout is in progress: the next set, and the
// rest countdown with its bar. Shown from the app's root so it follows the
// workout wherever the user is, and removed when the workout ends.

// The buttons: Complete Set between sets; while resting, Skip / -15s / +15s.
const SET_BUTTONS: NotificationButton[] = [
  { id: NOTIFICATION_BUTTON_IDS.complete, label: NOTIFICATION_BUTTON_LABELS.complete },
];
const REST_BUTTONS: NotificationButton[] = [
  { id: NOTIFICATION_BUTTON_IDS.skip, label: NOTIFICATION_BUTTON_LABELS.skip },
  { id: NOTIFICATION_BUTTON_IDS.minus15, label: NOTIFICATION_BUTTON_LABELS.minus15 },
  { id: NOTIFICATION_BUTTON_IDS.plus15, label: NOTIFICATION_BUTTON_LABELS.plus15 },
];

function onButton(action: NotificationAction) {
  if (action.id === NOTIFICATION_BUTTON_IDS.complete) {
    completeNextSet().catch((e) => console.warn('[notification] complete set failed', e));
  } else if (REST_BUTTONS.some((b) => b.id === action.id)) {
    setRest(action.restEndsAt ?? null, action.restTotal ?? null);
  }
}

// What ✓ does in Log Workout, for the set the notification shows: the PR
// chime and buzz (the toast is only in the app), then the rest timer.
// Waits for the draft to load: the button can be the first thing after the app opens.
async function completeNextSet() {
  const workout = await getActiveWorkout();
  const next = workout && nextSet(workout);
  if (!next) return;
  await completeSet(next.exercise.key, next.set.key);
}

// Only what the notification shows, so typing in a set it doesn't show
// doesn't redraw it.
// None for a workout logged afterwards for a past day: nothing is happening now.
function shownContent(workout: ActiveWorkout | null) {
  return workout && !workout.backdated ? notificationContent(workout, perHandOn) : null;
}

let askedPermission = false;

function askPermission() {
  if (askedPermission || Platform.OS !== 'android' || Platform.Version < 33) return;
  askedPermission = true;
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).catch(() => {});
}

export function useWorkoutNotification() {
  const content = useActiveWorkoutSelect(shownContent, sameNotification);

  useEffect(() => onNotificationAction(onButton), []);

  useEffect(() => {
    if (!content) {
      hideWorkoutNotification();
      return;
    }
    askPermission();
    const c = content;
    showWorkoutNotification({
      title: c.title,
      setText: c.setText,
      restText: c.restText,
      restEndsAt: c.restEndsAt,
      restTotal: c.restTotal,
      image: c.catalogueId ? stillUri(mediaIdFor(c.catalogueId, currentDrawings())) : null,
      setButtons: SET_BUTTONS,
      restButtons: REST_BUTTONS,
    });
  }, [content]);
}
