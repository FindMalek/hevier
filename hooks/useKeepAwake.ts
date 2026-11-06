import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

// Keeps the screen on while `on` (Workout Settings' Keep Awake During Workout).
export function useKeepAwake(on: boolean, tag: string) {
  useEffect(() => {
    if (!on) return;
    activateKeepAwakeAsync(tag);
    return () => {
      deactivateKeepAwake(tag);
    };
  }, [on, tag]);
}
