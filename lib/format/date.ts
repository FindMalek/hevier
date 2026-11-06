import { DATE_LOCALE, MONTH_DAY_FORMAT, MONTH_NAMES, TIME_OF_DAY_FORMAT } from '@/constants/time';

// Every date / time text of the app, in one style (the en-US one).

const otherYear = (d: Date, now: Date) => d.getFullYear() !== now.getFullYear();
const pad = (n: number) => String(n).padStart(2, '0');

// "6:44 PM"
export function timeLabel(d: Date): string {
  return d.toLocaleTimeString(DATE_LOCALE, TIME_OF_DAY_FORMAT);
}

// "Oct 15", never the year.
export function monthDay(d: Date): string {
  return d.toLocaleDateString(DATE_LOCALE, MONTH_DAY_FORMAT);
}

// "Oct 6", or "Oct 6, 2025" when it isn't this year.
export function shortDate(d: Date, now = new Date()): string {
  return d.toLocaleDateString(DATE_LOCALE, { ...MONTH_DAY_FORMAT, ...(otherYear(d, now) ? { year: 'numeric' } : {}) });
}

// "Sep"
export function monthName(d: Date): string {
  return MONTH_NAMES[d.getMonth()];
}

// "Sep", or "Sep 2025" when it isn't this year.
export function shortMonth(d: Date, now = new Date()): string {
  return otherYear(d, now) ? `${monthName(d)} ${d.getFullYear()}` : monthName(d);
}

// "October 2026"
export function monthYear(d: Date): string {
  return d.toLocaleDateString(DATE_LOCALE, { month: 'long', year: 'numeric' });
}

// "M" (a Monday)
export function weekdayLetter(d: Date): string {
  return d.toLocaleDateString(DATE_LOCALE, { weekday: 'narrow' });
}

// "Tue, Oct 13"
export function weekdayDate(d: Date): string {
  return d.toLocaleDateString(DATE_LOCALE, { weekday: 'short', ...MONTH_DAY_FORMAT });
}

// "Oct 14, 2026"
export function fullDate(d: Date): string {
  return d.toLocaleDateString(DATE_LOCALE, { ...MONTH_DAY_FORMAT, year: 'numeric' });
}

// "Oct 14, 2026, 11:08 PM"
export function dateTimeLabel(d: Date): string {
  return `${fullDate(d)}, ${timeLabel(d)}`;
}

// "Tue, Oct 14, 2026, 6:44 PM"
export function weekdayDateTime(d: Date): string {
  return d.toLocaleString(DATE_LOCALE, { weekday: 'short', ...MONTH_DAY_FORMAT, year: 'numeric', ...TIME_OF_DAY_FORMAT });
}

// "Monday, Oct 13, 2026 · 6:44 PM" (the workout page)
export function longDateTime(d: Date): string {
  const day = d.toLocaleDateString(DATE_LOCALE, { weekday: 'long', ...MONTH_DAY_FORMAT, year: 'numeric' });
  return `${day} · ${timeLabel(d)}`;
}


// "18:44" (24-hour, the Sync with PC screen)
export function clock24(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "23 Oct 09:05" (the Sync with PC screen)
export function compactDateTime(d: Date): string {
  return `${d.getDate()} ${monthName(d)} ${clock24(d)}`;
}
