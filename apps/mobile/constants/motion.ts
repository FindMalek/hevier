// Every animation and timing value in the app: durations, delays, springs and
// clock ticks, one group per feature, A to Z. Each group names the file that
// uses it. Time units themselves (MS_PER_SECOND…) are in constants/time.ts.

// components/ui/BottomSheet.tsx
export const SHEET_MOTION = {
  openMs: 250, // slide up
  closeMs: 200, // slide down
};

// app/_layout.tsx: work put off at start-up so Home loads first.
export const STARTUP_DELAYS = {
  quietSyncMs: 3000, // copy to the PC when the app opens or comes back
  widgetsMs: 2000, // refresh the home-screen widgets
};

// components/workout/ClockSheet.tsx and activeWorkoutStore.ts
export const CLOCK_TICKS = {
  workoutTickMs: 1000, // useNow: Duration and rest countdown, once a second
  clockSheetTickMs: 250, // the clock sheet, 4 times a second while something runs
  untilSlackMs: 10, // useUntil wakes this late, so `endsAt` has surely passed
};

// components/ui/Confetti.tsx: each piece gets random values in these ranges.
export const CONFETTI_MOTION = {
  fallMinMs: 2200, // shortest fall
  fallExtraMs: 1600, // up to this much longer
  delayMaxMs: 500, // pieces start within this
  driftPx: 160, // sideways travel, spread evenly left and right
  spinMinDeg: 360, // turn over the fall, either way
  spinExtraDeg: 720, // up to this much more
  widthMinPx: 6,
  widthExtraPx: 6,
  heightMinPx: 10,
  heightExtraPx: 8,
};

// components/routines/CycleCard.tsx
export const CYCLE_CARD_MOTION = {
  enterMs: 380, // the card fades in from below
  nameEnterMs: 260, // the next routine's name fades in from the right
  glowMs: 900, // one half-breath of the progress bar's glow
  glowDimOpacity: 0.35, // the glow's low point
  glowHalfBreaths: 6, // reversed each time: ends back at full brightness
};

// components/workout/PrToast.tsx
export const PR_TOAST_MOTION = {
  shownMs: 4000, // stays this long before sliding back up
  hideMs: 220, // slide back up
  dropSpring: { friction: 6, tension: 90 }, // drops in from above
  medalSpring: { friction: 4, tension: 120 }, // the medal pops in when the set is ticked
};

// components/ui/ReorderList.tsx: the dragged row settles into its slot.
export const REORDER_LIST_MOTION = {
  settleSpring: { speed: 30, bounciness: 0 },
};

// components/routines/RoutineDrag.tsx
export const ROUTINE_DRAG_MOTION = {
  holdMs: 300, // hold a card this long to lift it
  liftScale: 1.04, // a lifted card grows a little
  liftSpring: { damping: 22, stiffness: 260, mass: 0.6 },
  shiftMs: 160, // the cards around slide apart to open the gap
  dropMs: 170, // letting go glides the card into the gap
  slotFadeMs: 120, // the outline where the card would land
};

// components/ui/SwipeToDelete.tsx
export const SWIPE_TO_DELETE_MOTION = {
  settleMs: 180, // the row snaps open, closed or off after a swipe
  deleteMs: 150, // tapping Delete slides the row away
};

// lib/sync/client.ts: how long to wait for the PC program.
export const SYNC_TIMEOUTS = {
  requestMs: 10_000, // a sync or status the user asked for
  quietMs: 2000, // the quiet copy on app open: gives up fast
  commitMs: 60_000, // the PC checks and files the copy it received
  // A photo, video or database transfer is given up when no bytes moved for
  // this long. There is no limit on the whole transfer: a big file over slow
  // Wi-Fi may take minutes, but it keeps moving.
  stallMs: 30_000,
};

// app/sync-scan.tsx: how long the camera ignores a code the user said no to.
export const SYNC_SCAN_RETRY_MS = 5000;

// How often a scrolling list reports its position: about once a frame.
export const SCROLL_EVENTS = {
  throttleMs: 16,
};
