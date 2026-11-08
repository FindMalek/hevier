// Where a swiped set row comes to rest (components/ui/SwipeToDelete.tsx).
// Kept apart from the gesture so it can be tested; a worklet because the
// gesture runs on the UI thread.

// `end` is where the finger left the row (0 closed, negative = slid left).
// Past half the screen the row goes off (-width) and is deleted; past half of
// the Delete button's width it stays open; else it closes.
export function swipeSettle(end: number, width: number, open: number): number {
  'worklet';
  if (end < -width / 2) return -width;
  if (end < -open / 2) return -open;
  return 0;
}
