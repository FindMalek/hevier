import { useCallback, useRef } from 'react';

// Something to do once a bottom sheet has slid away, so what it opens (a dialog,
// the photo picker, another screen) doesn't appear over it.
// `later(action)` when an option is tapped, then pass `onClosed` to the BottomSheet.
export function useAfterSheetClose() {
  const pending = useRef<(() => void) | null>(null);
  const later = useCallback((action: () => void) => {
    pending.current = action;
  }, []);
  const onClosed = useCallback(() => {
    const action = pending.current;
    pending.current = null;
    action?.();
  }, []);
  return { later, onClosed };
}
