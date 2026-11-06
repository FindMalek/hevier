import { describe, expect, it } from 'vitest';
import { round2, shortVolumeLabel, thousandsLabel, volumeLabel } from './weight';

describe('weight format', () => {
  it('volume with thousands separators', () => {
    expect(volumeLabel(1000)).toBe('1,000 kg');
    expect(volumeLabel(0)).toBe('0 kg');
    expect(volumeLabel(6122.4)).toBe('6,122 kg');
  });

  it('thousands', () => {
    expect(thousandsLabel(19200)).toBe('19k kg');
    expect(thousandsLabel(71_400)).toBe('71k kg');
  });

  it('short volume switches at the threshold', () => {
    expect(shortVolumeLabel(800)).toBe('800 kg');
    expect(shortVolumeLabel(999)).toBe('999 kg');
    expect(shortVolumeLabel(1000)).toBe('1k kg');
    expect(shortVolumeLabel(4500)).toBe('5k kg');
    expect(shortVolumeLabel(12_300)).toBe('12k kg');
    expect(shortVolumeLabel(71_400)).toBe('71k kg');
  });

  it('two decimals at most', () => {
    expect(round2(106.666)).toBe('106.67');
    expect(round2(2.5)).toBe('2.5');
    expect(round2(100)).toBe('100');
  });
});
