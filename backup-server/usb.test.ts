import { describe, expect, it } from 'vitest';
import { parsePhones } from './usb';

describe('usb', () => {
  it('lists plugged phones ready for adb, not emulators or unauthorized ones', () => {
    const out = [
      'List of devices attached',
      'ABC123DEF456\tdevice',
      'emulator-5554\tdevice',
      'ABC123\tunauthorized',
      '',
    ].join('\n');
    expect(parsePhones(out)).toEqual(['ABC123DEF456']);
    expect(parsePhones('List of devices attached\n\n')).toEqual([]);
  });
});
