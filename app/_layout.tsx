import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  useFonts,
} from '@expo-google-fonts/figtree';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Profiler, useEffect } from 'react';
import { AppState, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { setTimerDoneHandler } from '@/stores/clockStore';
import { onPerfRender } from '@/lib/perfProbe';
import { alertTimerDone } from '@/lib/prFeedback';
import { refreshHomeWidgets } from '@/lib/refreshHomeWidgets';
import { quietSync } from '@/lib/sync/client';
import { expoIO } from '@/lib/sync/expoIO';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useDataWaiting } from '@/hooks/useDataWaiting';
import { useWorkoutNotification } from '@/hooks/useWorkoutNotification';
import { STARTUP_DELAYS } from '@/constants/motion';
import { SPACE } from '@/constants/layout';
import { FONTS } from '@/constants/theme';
import { NAVIGATION_THEME } from '@/constants/navigation';

// The Clock sheet's timer buzzes and chimes at zero, wherever the user is.
setTimerDoneHandler(alertTimerDone);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before the fonts are loaded.
SplashScreen.preventAutoHideAsync();

// The app is dark-only; the navigation theme only needs to match it.

// Kept out of RootLayout's render, so it isn't rebuilt on every change.
const stackOptions = { headerTitleStyle: { fontFamily: FONTS.medium } };

// The next set and rest countdown in the notification bar. Its own component,
// so a workout change redraws only it, not the whole navigator.
function WorkoutNotification() {
  useWorkoutNotification();
  return null;
}

// A copy goes to the PC whenever the app opens or comes back, if the Hevier
// Sync window is open there. A few seconds late, so Home loads first.
function QuietSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => quietSync(expoIO), STARTUP_DELAYS.quietSyncMs);
    };
    soon();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && soon());
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);
  return null;
}

// The home-screen widgets get fresh data when the app opens and each time it
// goes to the background: whatever changed in between (a saved workout, a
// renamed routine, a skipped cycle step) is there before the home screen shows.
function HomeWidgets() {
  useEffect(() => {
    const timer = setTimeout(refreshHomeWidgets, STARTUP_DELAYS.widgetsMs);
    const sub = AppState.addEventListener('change', (state) => state === 'background' && refreshHomeWidgets());
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);
  return null;
}

// Shown instead of the app while data from an interrupted restore can't be
// put back yet: nothing is lost, and opening the app again retries it.
function DataWaiting({ message, trying, onRetry }: { message: string; trying: boolean; onRetry: () => void }) {
  return (
    <Screen style={styles.waiting}>
      <StatusBar style="light" />
      <EmptyState
        title="Your data is waiting"
        message={message}
        action={<Button label="Try again" busy={trying} onPress={onRetry} style={styles.retry} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  waiting: { justifyContent: 'center', paddingHorizontal: SPACE.xl },
  retry: { marginTop: SPACE.xl, alignSelf: 'stretch' },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const { message: dataWaiting, trying, retry } = useDataWaiting();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // The notification runs from the start, fonts or not (a tap on its button
  // can be what opened the app).
  if (!loaded) {
    return <WorkoutNotification />;
  }

  if (dataWaiting) {
    return <DataWaiting message={dataWaiting} trying={trying} onRetry={retry} />;
  }

  // The gesture root: dragging routines on the Workout tab (components/routines/RoutineDrag.tsx).
  return (
    <>
      <WorkoutNotification />
      <QuietSync />
      <HomeWidgets />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={NAVIGATION_THEME}>
          <StatusBar style="light" />
          {/* The smoothness test's meter (lib/perfProbe.ts); idle unless a ?perf= link turns it on. */}
          <Profiler id="app" onRender={onPerfRender}>
            <Stack screenOptions={stackOptions}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </Profiler>
        </ThemeProvider>
      </GestureHandlerRootView>
    </>
  );
}
