import { describe, expect, it } from 'vitest';
import { labelAnchor, labelDy, radarLayout, radarPoint, radarPolygon, ringValues, spokeAngle } from './radarGeometry';

const layout = radarLayout(432);

describe('radar geometry', () => {
  it('fits the radar in the width, 4:5 tall', () => {
    expect(layout).toEqual({ size: 400, height: 320, cx: 200, cy: 160, radius: 122 });
  });

  it('starts the first spoke at the top, then goes clockwise', () => {
    expect(spokeAngle(0, 4)).toBeCloseTo(-Math.PI / 2);
    expect(spokeAngle(1, 4)).toBeCloseTo(0);
  });

  it('places values along a spoke and stops them at the edge', () => {
    const [x, y] = radarPoint(layout, 0, 4, 5, 10);
    expect(x).toBeCloseTo(200);
    expect(y).toBeCloseTo(160 - 61);
    const [ex] = radarPoint(layout, 1, 4, 99, 10);
    expect(ex).toBeCloseTo(200 + 122);
  });

  it('joins one point per value into polygon points', () => {
    expect(radarPolygon(layout, [0, 0], 10)).toBe('200,160 200,160');
  });

  it('draws a ring every 2 sets', () => {
    expect(ringValues(8)).toEqual([2, 4, 6, 8]);
  });

  it('hangs labels off their spoke', () => {
    expect([labelAnchor(1), labelAnchor(0), labelAnchor(-1)]).toEqual(['start', 'middle', 'end']);
    expect([labelDy(1), labelDy(0), labelDy(-1)]).toEqual([12, 5, -2]);
  });
});
