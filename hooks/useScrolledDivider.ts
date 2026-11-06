import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

// A tab header's divider shows once its list is scrolled down (Home, Workout, Profile).
// It only changes at the top: setState on the flip, not on every scroll event.
export function useScrolledDivider() {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const now = e.nativeEvent.contentOffset.y > 0;
    if (now !== scrolledRef.current) {
      scrolledRef.current = now;
      setScrolled(now);
    }
  }, []);
  return { scrolled, onScroll };
}
