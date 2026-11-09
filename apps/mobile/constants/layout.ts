// Spacing, corner radius, border widths and touch areas.
//
// Use a role name when the thing has one (LAYOUT.screenMargin, RADIUS.button);
// otherwise pick a step from the scale (SPACE.md). Sizes that belong to one
// component only (a card's height, an icon's width) are named at the top of
// that component instead.

// Padding, margin and gap: a small scale on a 4 dp grid (plus 2 for fine nudges).
export const SPACE = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40, // room under the last item of a scrolling page
};

// Corner radius.
const RADIUS_SCALE = {
  xs: 2,
  sm: 4,
  md: 8, // inputs, set boxes, small tiles
  lg: 10,
  xl: 12,
  xxl: 16,
  round: 999, // fully round ends: dots, bars, pills, circular buttons
};

export const RADIUS = {
  ...RADIUS_SCALE,
  button: RADIUS_SCALE.lg,
  card: RADIUS_SCALE.xl,
  sheet: RADIUS_SCALE.xxl,
  pill: RADIUS_SCALE.round,
};

// Named distances used all over the app.
export const LAYOUT = {
  screenMargin: SPACE.lg, // left / right margin of every screen
  cardPadding: SPACE.lg, // inside a card
};

export const BORDER_WIDTHS = {
  hairline: 1,
  thin: 1.5,
  thick: 3,
};

// Extra touch area around small buttons (Pressable hitSlop).
export const HIT_SLOPS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};
