import {
  DATE_WITH_ZONE,
  DAY_FIRST_DATE,
  HOURS_ON_CLOCK,
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  MIN_IMPORT_YEAR,
  MONTH_ABBREVIATIONS,
  MONTH_FIRST_DATE,
  NUMERIC_DATE,
  TIME_ZONE_ENV,
  UNKNOWN_TIME_ZONE,
} from '@/constants/import';
import { MS_PER_DAY, MS_PER_MINUTE, MS_PER_SECOND, SECONDS_PER_MINUTE } from '@/constants/time';
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
      format = new Intl.DateTimeFormat('en-US', {
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
  const p: Record<string, number> = {};
  for (const part of formatterFor(timeZone).formatToParts(ms)) p[part.type] = Number(part.value);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (wall - Math.floor(ms / MS_PER_SECOND) * MS_PER_SECOND) / MS_PER_MINUTE;
}

function monthIndex(name: string): number {
  return MONTH_ABBREVIATIONS.indexOf(name.slice(0, 3).toLowerCase() as (typeof MONTH_ABBREVIATIONS)[number]);
}

function hour24(hour: number, meridiem: string | undefined): number {
  if (!meridiem) return hour;
  return (hour % HOURS_ON_CLOCK) + (meridiem.toUpperCase() === 'PM' ? HOURS_ON_CLOCK : 0);
}

function parts(value: string): DateParts | null {
  let m = MONTH_FIRST_DATE.exec(value);
  if (m) return [Number(m[3]), monthIndex(m[1]), Number(m[2]), hour24(Number(m[4]), m[7]), Number(m[5]), Number(m[6] ?? 0)];
  m = DAY_FIRST_DATE.exec(value);
  if (m) return [Number(m[3]), monthIndex(m[2]), Number(m[1]), hour24(Number(m[4]), m[7]), Number(m[5]), Number(m[6] ?? 0)];
  m = NUMERIC_DATE.exec(value);
  if (m) return [Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)];
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
    const t = Date.parse(text.replace(' ', 'T'));
    if (Number.isNaN(t)) throw fail();
    return new Date(t).toISOString();
  }
  const p = parts(text);
  if (!p || p[1] < 0 || p[0] < MIN_IMPORT_YEAR) throw fail();
  const [year, month, day, hour, minute, second] = p;
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
  const before = guess - offsetMinutes(guess - MS_PER_DAY, timeZone) * MS_PER_MINUTE;
  const after = guess - offsetMinutes(guess + MS_PER_DAY, timeZone) * MS_PER_MINUTE;
  const fits = (t: number) => guess - offsetMinutes(t, timeZone) * MS_PER_MINUTE === t;
  const candidates = [before, after].filter(fits);
  return new Date(candidates.length > 0 ? Math.min(...candidates) : Math.max(before, after)).toISOString();
}
