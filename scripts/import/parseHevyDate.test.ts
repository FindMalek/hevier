import { afterEach, describe, expect, it } from 'vitest';
import { checkTimeZone, machineTimeZone, parseHevyDate } from './parseHevyDate';

type DateCase = [text: string, zone: string, iso: string];

const readsAs = (name: string, cases: DateCase[]) =>
  it.each(cases)(`${name}: %s in %s is %s`, (text, zone, iso) => {
    expect(parseHevyDate(text, zone)).toBe(iso);
  });

describe('parseHevyDate', () => {
  describe('formats', () => {
    readsAs('reads 12-hour, 24-hour and numeric dates', [
      ['Oct 1, 2026, 12:05 AM', 'UTC', '2026-10-01T00:05:00.000Z'],
      ['1 Oct 2026, 18:00', 'UTC', '2026-10-01T18:00:00.000Z'],
      ['2026-10-01 18:00:30', 'America/New_York', '2026-10-01T22:00:30.000Z'],
    ]);
    readsAs('puts a late session on the right day', [
      ['Oct 1, 2026, 12:30 AM', 'Asia/Tokyo', '2026-09-30T15:30:00.000Z'],
      ['Oct 1, 2026, 11:30 PM', 'America/Los_Angeles', '2026-10-02T06:30:00.000Z'],
    ]);
    readsAs('keeps a zone the date names itself', [
      ['2026-10-01T18:00:00+02:00', 'Asia/Tokyo', '2026-10-01T16:00:00.000Z'],
    ]);
  });

  describe('clock changes', () => {
    readsAs('uses the zone offset of that date', [
      ['Jan 15, 2026, 9:00 AM', 'Europe/Paris', '2026-01-15T08:00:00.000Z'],
      ['Jul 15, 2026, 9:00 AM', 'Europe/Paris', '2026-07-15T07:00:00.000Z'],
    ]);
    readsAs('reads the hour before a change', [
      ['Mar 29, 2026, 1:30 AM', 'Europe/Paris', '2026-03-29T00:30:00.000Z'],
      ['Oct 25, 2026, 1:30 AM', 'Europe/Paris', '2026-10-24T23:30:00.000Z'],
    ]);
    readsAs('reads the hour after a change', [
      ['Mar 29, 2026, 3:30 AM', 'Europe/Paris', '2026-03-29T01:30:00.000Z'],
      ['Oct 25, 2026, 3:30 AM', 'Europe/Paris', '2026-10-25T02:30:00.000Z'],
    ]);
    readsAs('moves a time that never happened forward by the gap', [
      ['Mar 29, 2026, 2:30 AM', 'Europe/Paris', '2026-03-29T01:30:00.000Z'],
      ['Mar 8, 2026, 2:30 AM', 'America/New_York', '2026-03-08T07:30:00.000Z'],
    ]);
    readsAs('reads a time that happened twice as its first occurrence', [
      ['Oct 25, 2026, 2:30 AM', 'Europe/Paris', '2026-10-25T00:30:00.000Z'],
      ['Nov 1, 2026, 1:30 AM', 'America/New_York', '2026-11-01T05:30:00.000Z'],
    ]);
  });

  it.each([
    'Feb 31, 2026, 6:00 PM',
    'someday',
    'Oct 1, 0099, 6:00 PM',
    '2026-10-01 18:00:00 +02:00',
  ])('rejects %s', (text) => {
    expect(() => parseHevyDate(text, 'UTC')).toThrow('Could not parse date');
  });
});

describe('checkTimeZone', () => {
  it('accepts IANA names and rejects anything else', () => {
    expect(checkTimeZone('Europe/Paris')).toBe('Europe/Paris');
    expect(() => checkTimeZone('Mars/Olympus')).toThrow('Unknown time zone');
  });
});

describe('machineTimeZone', () => {
  const tz = process.env.TZ;
  afterEach(() => {
    if (tz === undefined) delete process.env.TZ;
    else process.env.TZ = tz;
  });

  it('is the zone dates are read in when none is given', () => {
    process.env.TZ = 'Asia/Tokyo';
    expect(machineTimeZone()).toBe('Asia/Tokyo');
    expect(parseHevyDate('Oct 1, 2026, 12:30 AM')).toBe('2026-09-30T15:30:00.000Z');
  });

  it.each([['an empty TZ', ''], ['an invalid TZ', 'Bogus/Zone']])('says how to name a zone when it has %s', (_name, value) => {
    process.env.TZ = value;
    expect(() => machineTimeZone()).toThrow(/Unknown time zone.*HEVIER_TIMEZONE/);
  });
});
