import { describe, expect, it } from 'vitest';
import { swipeSettle } from './swipeToDelete';

const WIDTH = 400;
const OPEN = 120;

describe('swipeSettle', () => {
  it('goes off the screen past half the width', () => {
    expect(swipeSettle(-201, WIDTH, OPEN)).toBe(-WIDTH);
  });

  it('stays open past half the Delete button', () => {
    expect(swipeSettle(-61, WIDTH, OPEN)).toBe(-OPEN);
    expect(swipeSettle(-200, WIDTH, OPEN)).toBe(-OPEN);
  });

  it('closes when released short of that, or dragged back right', () => {
    expect(swipeSettle(-60, WIDTH, OPEN)).toBe(0);
    expect(swipeSettle(0, WIDTH, OPEN)).toBe(0);
  });
});
