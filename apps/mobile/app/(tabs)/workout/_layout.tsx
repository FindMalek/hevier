import { Stack } from 'expo-router';

// The Workout tab is a stack so the routine page keeps the tab bar.
export default function WorkoutStack() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
