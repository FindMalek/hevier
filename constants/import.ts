// What the Hevy CSV import (scripts/import/) expects and converts.

export const KG_PER_LB = 0.45359237;
export const KM_PER_MILE = 1.609344;

// Hevy writes metric or imperial exports; the app is kg and km only.
export const WEIGHT_COLUMNS = { kg: 'weight_kg', lbs: 'weight_lbs' } as const;
export const DISTANCE_COLUMNS = { km: 'distance_km', miles: 'distance_miles' } as const;

export const CSV_COLUMNS = [
  'title',
  'start_time',
  'end_time',
  'description',
  'exercise_title',
  'superset_id',
  'exercise_notes',
  'set_index',
  'set_type',
  'reps',
  'duration_seconds',
  'rpe',
] as const;

// Converted values are rounded to this many decimals (135 lb = 61.235 kg).
export const CONVERTED_DECIMALS = 4;

// Month abbreviations in Hevy's dates ("Oct 1, 2026, 6:00 PM").
export const MONTH_ABBREVIATIONS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

// Hevy's dates: "Oct 1, 2026, 6:00 PM", "1 Oct 2026, 18:00", "2026-10-01 18:00:00".
export const MONTH_FIRST_DATE = /^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i;
export const DAY_FIRST_DATE = /^(\d{1,2}) ([A-Za-z]{3,9})\.? (\d{4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i;
export const NUMERIC_DATE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?$/;
export const DATE_WITH_ZONE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/i;

// Dates before this are read as a typo, not as history.
export const MIN_IMPORT_YEAR = 1900;
export const HOURS_PER_DAY = 24;
export const HOURS_ON_CLOCK = 12;
export const MINUTES_PER_HOUR = 60;

// Hevy's dates carry no time zone: they are read in this one, the machine's
// unless HEVIER_TIMEZONE names another (an IANA name, "Europe/Paris").
export const TIME_ZONE_ENV = 'HEVIER_TIMEZONE';

// What Intl reports when TZ is empty.
export const UNKNOWN_TIME_ZONE = 'Etc/Unknown';

// How many skipped rows the import prints.
export const SHOWN_SKIPPED_ROWS = 10;

// The import stops when more than this share of the rows can't be read, so a
// CSV in the wrong format never replaces the app's data with a near-empty one.
export const MAX_SKIPPED_SHARE = 0.1;
