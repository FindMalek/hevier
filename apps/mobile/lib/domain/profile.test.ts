import { describe, expect, it } from 'vitest';
import { usernameFrom } from './profile';

describe('usernameFrom', () => {
  it('keeps letters and digits, lowercase, accents dropped', () => {
    expect(usernameFrom('Sam Lee')).toBe('samlee');
    expect(usernameFrom('Zoë 2')).toBe('zoe2');
    expect(usernameFrom('***')).toBe('athlete');
  });
});
