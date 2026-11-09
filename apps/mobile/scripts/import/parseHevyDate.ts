import {
  DATE_WITH_ZONE,
  DAY_FIRST_DATE,
  MIN_IMPORT_YEAR,
  MONTH_FIRST_DATE,
  MONTH_KEYS,
  NUMERIC_DATE,
  TIME_ZONE_ENV,
  UNKNOWN_TIME_ZONE,
} from '@/constants/hevyCsv';
import {
  DATE_LOCALE,
  HOURS_ON_CLOCK,
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  MS_PER_DAY,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  SECONDS_PER_MINUTE,
} from '@/constants/time';
import type { DateParts } from '@/types/import';

const formatters = new Map<string, Intl.DateTimeFormat>();

// The computer's zone, or an error that says how to name one instead (an
// empty or invalid TZ makes Intl answer Etc/Unknown or nothing).
export function machineTimeZone(): string {
  const zone: string | undefined = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!zone || zone === UNKNOWN_TIME_ZONE) {
    throw new Error(`Unknown time zone: "${process.env.TZ ?? ''}" (set ${TIME_ZONE_ENV}, for example Europe/Paris)`);
  }
  return zone;
}

// Throws for a name that is not an IANA time zone.
function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let format = formatters.get(timeZone);
  if (!format) {
    try {
      format = new Intl.DateTimeFormat(DATE_LOCALE, {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
    } catch {
      throw new Error(`Unknown time zone: "${timeZone}" (use a name like Europe/Paris)`);
    }
    formatters.set(timeZone, format);
  }
  return format;
}

export function checkTimeZone(timeZone: string): string {
  formatterFor(timeZone);
  return timeZone;
}

// Minutes the zone is ahead of UTC at the instant `ms`.
function offsetMinutes(ms: number, timeZone: string): number {
  const fields: Record<string, number> = {};
  for (const part of formatterFor(timeZone).formatToParts(ms)) fields[part.type] = Number(part.value);
  const wall = Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute, fields.second);
  return (wall - Math.floor(ms / MS_PER_SECOND) * MS_PER_SECOND) / MS_PER_MINUTE;
}

function monthIndex(name: string): number {
  return MONTH_KEYS.indexOf(name.slice(0, 3).toLowerCase());
}

function hour24(hour: number, meridiem: string | undefined): number | null {
  if (!meridiem) return hour;
  if (hour < 1 || hour > HOURS_ON_CLOCK) return null;
  return (hour % HOURS_ON_CLOCK) + (meridiem.toUpperCase() === 'PM' ? HOURS_ON_CLOCK : 0);
}

function readParts(value: string): DateParts | null {
  const named = MONTH_FIRST_DATE.exec(value) ?? DAY_FIRST_DATE.exec(value);
  if (named?.groups) {
    const { year, month, day, hour, minute, second, meridiem } = named.groups;
    const hourOfDay = hour24(Number(hour), meridiem);
    if (hourOfDay === null) return null;
    return {
      year: Number(year),
      month: monthIndex(month),
      day: Number(day),
      hour: hourOfDay,
      minute: Number(minute),
      second: Number(second ?? 0),
    };
  }
  const numeric = NUMERIC_DATE.exec(value);
  if (numeric?.groups) {
    const { year, month, day, hour, minute, second } = numeric.groups;
    return {
      year: Number(year),
      month: Number(month) - 1,
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      second: Number(second ?? 0),
    };
  }
  return null;
}

// Hevy's dates have no time zone, so they are read as wall-clock time in
// `timeZone`, daylight saving included per date: the same CSV and zone always
// import to the same instants. A time that happens twice (clocks going back)
// is read as its first occurrence; one that never happens (clocks going
// forward) is moved forward by the gap. A date that names its own zone keeps it.
export function parseHevyDate(value: string, timeZone = machineTimeZone()): string {
  const text = value.trim();
  const fail = () => new Error(`Could not parse date: "${value}"`);
  if (DATE_WITH_ZONE.test(text)) {
    const instant = Date.parse(text.replace(' ', 'T'));
    if (Number.isNaN(instant)) throw fail();
    return new Date(instant).toISOString();
  }
  const parsed = readParts(text);
  if (!parsed || parsed.month < 0 || parsed.year < MIN_IMPORT_YEAR) throw fail();
  const { year, month, day, hour, minute, second } = parsed;
  const wall = new Date(Date.UTC(year, month, day, hour, minute, second));
  const valid =
    wall.getUTCMonth() === month &&
    wall.getUTCDate() === day &&
    hour < HOURS_PER_DAY &&
    minute < MINUTES_PER_HOUR &&
    second < SECONDS_PER_MINUTE;
  if (!valid) throw fail();
  const guess = wall.getTime();
  // The zone's offset a day before and a day after is the one in force on
  // either side of a clock change, whichever way the zone sits from UTC.
  const utcIf = (offsetAt: number): number => guess - offsetMinutes(offsetAt, timeZone) * MS_PER_MINUTE;
  const before = utcIf(guess - MS_PER_DAY);
  const after = utcIf(guess + MS_PER_DAY);
  const fits = (instant: number): boolean => utcIf(instant) === instant;
  const candidates = [before, after].filter(fits);
  return new Date(candidates.length > 0 ? Math.min(...candidates) : Math.max(before, after)).toISOString();
}
