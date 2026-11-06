
// Every training rule the app uses, in one place. Most come from a study:
// the sources are in docs/science/sets.md and docs/science/recovery.md.
// Change a number here and the statistics, body map and widgets all follow.

// --- How much a set counts (lib/training/effort.ts) -----------------------------------
// Muscle growth tracks sets taken near failure, not tonnage, so a heavy set of
// 6 to failure counts as much as a set of 12 to failure.

export const HARD_RIR = 3; // within 3 reps of failure = a full hard set
export const MIN_SET_WEIGHT = 0.3; // an easy set still counts this much
export const WEIGHT_PER_RIR = 0.14; // each rep left past HARD_RIR: RIR 3 → 1, RIR 8 → 0.3
export const WARMUP_SET_WEIGHT = 0.3; // a small credit, not a working set
export const SECONDARY_SHARE = 0.5; // a muscle that only helps counts half a set (best fit in Pelland 2024)
export const MAX_SETS_PER_SESSION = 12; // per muscle per workout; more is junk volume

// --- Weekly zones (sets per muscle per week) --------------------------------
// 3 sets a week kept muscle (Bickel 2011); 4 is the smallest weekly dose that
// grew it (Pelland 2024). They describe where the lifter is; they must not
// push for more volume.
export const ZONES = [
  { from: 0, label: 'Below maintenance', range: 'under 3 a week' },
  { from: 3, label: 'Maintenance', range: '3 a week' },
  { from: 4, label: 'Growth', range: '4+ a week' },
] as const;

// --- Recovery ----------------------------------------------------------------
// After a workout each muscle it trained gets a window from the sets it got:
// red for the first part, orange until the end, then green. Same for every
// muscle: the studies found none that recovers faster (docs/science/recovery.md).
//   about 1 set → 30 h, red the first 12 h (estimated; not measured)
//   2–3 sets    → 48 h, red the first 24 h (Morán-Navarro 2017, Pareja-Blanco 2017/2020)
//   4+ sets     → 72 h, red the first 24 h (Belcher 2019, Goulart 2021, Bartolomei 2017)
// Under 0.75 sets (a lone warm-up, one helper set) leaves no window.
export const RECOVERY_WINDOWS = [
  { from: 0.75, redHours: 12, hours: 30 },
  { from: 1.5, redHours: 24, hours: 48 },
  { from: 3.5, redHours: 24, hours: 72 },
] as const;

// A muscle trained this recently, and recovered, shows as "ready".
export const RECENTLY_TRAINED_DAYS = 7;

// --- Conditioning card (lib/training/conditioning.ts) ----------------------------------
// WHO 2020: 75–150 min of vigorous activity a week, or twice that moderate.
// Football is vigorous; other cardio counts as moderate, so half.
export const WEEKLY_CARDIO_TARGET_MIN = 75;
export const MODERATE_CARDIO_SHARE = 0.5;
export const CARDIO_WEEKS_LOOKBACK = 4; // "met the target N of the last 4 weeks"

// --- Push / Pull (lib/training/pushPull.ts) ----------------------------------------------
export const PUSH_PULL_MIN_SETS = 3; // below this many push + pull sets a week the split says little
export const PUSH_PULL_BALANCED_RATIO = 1.2; // within 20% = Balanced
export const PUSH_HEAVY_RATIO = 1.5; // push past 1.5× pull = warning
export const PULL_HEAVY_RATIO = 2; // pull past 2× push = warning (some extra pull is fine)

// --- Muscle distribution radar (lib/training/distribution.ts) ---------------------------
export const RADAR_EDGE_SETS = 10; // outer ring: past ~10 a week extra sets clearly give less (Pelland 2024)
export const RADAR_RING_STEP = 2; // when a muscle goes past the edge, grow in steps of 2 sets

// --- Muscle split on a workout page (lib/stats/stats.ts) ----------------------------
// A set counts 1 for its main body part and this much for each other part its
// helper muscles reach. Separate from SECONDARY_SHARE on purpose: this is a
// display split, not the effort model.
export const SPLIT_OTHER_PART_SHARE = 0.5;

// --- Logging -------------------------------------------------------------------

// Top of the RPE scale: reps left are saved in sets.rpe as this minus reps left.
export const RPE_SCALE_MAX = 10;

// Choices in the rest timer picker, in seconds (null = off).
export const REST_CHOICES: (number | null)[] = [
  null, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 240, 270, 300,
];

// A workout logged for a past day starts at this hour and lasts this long until changed.
export const BACKDATED_START_HOUR = 18;
export const BACKDATED_DURATION_HOURS = 1;

export const RECENT_EXERCISES_LIMIT = 20; // "Recent Exercises" in the picker
export const MAX_MEDIA_PER_PICK = 10; // photos / videos added at once to a workout

// The exercise every workout starts with. Routines start it at 00:00, and the
// Statistics exercise list leaves it out (it is in nearly every workout).
export const WARM_UP_EXERCISE = 'Warm Up';
