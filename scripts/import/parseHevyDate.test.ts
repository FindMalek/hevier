import { afterEach, describe, expect, it } from 'vitest';
import { checkTimeZone, machineTimeZone, parseHevyDate } from './parseHevyDate';

describe('parseHevyDate', () => {
  it('reads 12-hour, 24-hour and numeric dates', () => {
    expect(parseHevyDate('Oct 1, 2026, 12:05 AM', 'UTC')).toBe('2026-10-01T00:05:00.000Z');
    expect(parseHevyDate('1 Oct 2026, 18:00', 'UTC')).toBe('2026-10-01T18:00:00.000Z');
    expect(parseHevyDate('2026-10-01 18:00:30', 'America/New_York')).toBe('2026-10-01T22:00:30.000Z');
  });

  it('puts a late session on the right day in zones ahead of and behind UTC', () => {
    expect(parseHevyDate('Oct 1, 2026, 12:30 AM', 'Asia/Tokyo')).toBe('2026-09-30T15:30:00.000Z');
    expect(parseHevyDate('Oct 1, 2026, 11:30 PM', 'America/Los_Angeles')).toBe('2026-10-02T06:30:00.000Z');
  });

  it('uses the zone offset of that date, so winter and summer differ', () => {
    expect(parseHevyDate('Jan 15, 2026, 9:00 AM', 'Europe/Paris')).toBe('2026-01-15T08:00:00.000Z');
    expect(parseHevyDate('Jul 15, 2026, 9:00 AM', 'Europe/Paris')).toBe('2026-07-15T07:00:00.000Z');
  });

  it('reads the hour before a clock change correctly', () => {
    expect(parseHevyDate('Mar 29, 2026, 1:30 AM', 'Europe/Paris')).toBe('2026-03-29T00:30:00.000Z');
    expect(parseHevyDate('Oct 25, 2026, 1:30 AM', 'Europe/Paris')).toBe('2026-10-24T23:30:00.000Z');
  });

  it('reads the hour after a clock change correctly', () => {
    expect(parseHevyDate('Mar 29, 2026, 3:30 AM', 'Europe/Paris')).toBe('2026-03-29T01:30:00.000Z');
    expect(parseHevyDate('Oct 25, 2026, 3:30 AM', 'Europe/Paris')).toBe('2026-10-25T02:30:00.000Z');
  });

  it('moves a time that never happened forward by the gap, east and west of UTC', () => {
    expect(parseHevyDate('Mar 29, 2026, 2:30 AM', 'Europe/Paris')).toBe('2026-03-29T01:30:00.000Z');
    expect(parseHevyDate('Mar 8, 2026, 2:30 AM', 'America/New_York')).toBe('2026-03-08T07:30:00.000Z');
  });

  it('reads a time that happened twice as its first occurrence, east and west of UTC', () => {
    expect(parseHevyDate('Oct 25, 2026, 2:30 AM', 'Europe/Paris')).toBe('2026-10-25T00:30:00.000Z');
    expect(parseHevyDate('Nov 1, 2026, 1:30 AM', 'America/New_York')).toBe('2026-11-01T05:30:00.000Z');
  });

  it('keeps a zone the date names itself', () => {
    expect(parseHevyDate('2026-10-01T18:00:00+02:00', 'Asia/Tokyo')).toBe('2026-10-01T16:00:00.000Z');
  });

  it('rejects dates that do not exist', () => {
    expect(() => parseHevyDate('Feb 31, 2026, 6:00 PM', 'UTC')).toThrow('Could not parse date');
    expect(() => parseHevyDate('someday', 'UTC')).toThrow('Could not parse date');
    expect(() => parseHevyDate('Oct 1, 0099, 6:00 PM', 'UTC')).toThrow('Could not parse date');
    expect(() => parseHevyDate('2026-10-01 18:00:00 +02:00', 'UTC')).toThrow('Could not parse date');
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

  it("is the zone dates are read in when none is given", () => {
    process.env.TZ = 'Asia/Tokyo';
    expect(machineTimeZone()).toBe('Asia/Tokyo');
    expect(parseHevyDate('Oct 1, 2026, 12:30 AM')).toBe('2026-09-30T15:30:00.000Z');
  });

  it.each([['an empty TZ', ''], ['an invalid TZ', 'Bogus/Zone']])('says how to name a zone when it has %s', (_name, value) => {
    process.env.TZ = value;
    expect(() => machineTimeZone()).toThrow(/Unknown time zone.*HEVIER_TIMEZONE/);
  });
});
