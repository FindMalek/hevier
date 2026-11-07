// Time units, so code reads `3 * MS_PER_DAY` instead of `259_200_000`.

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;

export const DAYS_PER_WEEK = 7;

// Short month names, January first (matches Date.getMonth()).
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Short weekday names, Monday first (the calendar's week rows).
export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Every date and time on screen uses this one style ("Oct 13, 2026", "6:44 PM").
export const DATE_LOCALE = 'en-US';

// Intl options shared by lib/format/date.ts and its tests.
export const TIME_OF_DAY_FORMAT: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
export const MONTH_DAY_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
