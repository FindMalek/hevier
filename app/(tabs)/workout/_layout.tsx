import { Stack } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { WorkoutPill } from '@/components/ui/WorkoutPill';

// The Workout tab is a stack so the routine page keeps the tab bar. The
// workout pill floats over both of its pages.
export default function WorkoutStack() {
  return (
    <Screen>
      <Stack screenOptions={screenOptions} />
      <WorkoutPill />
    </Screen>
  );
}

// Outside the component: an inline options object is new on every render.
const screenOptions = { headerShown: false };
