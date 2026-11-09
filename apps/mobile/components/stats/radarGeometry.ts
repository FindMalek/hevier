import { STATISTICS_DISTRIBUTION_SIZES } from '@/constants/sizes';
import type { LabelAnchor, Point, RadarLayout } from './types';

// The maths of the Muscle distribution radar: one spoke per muscle, the first
// pointing up, then clockwise; values past the scale stop at the edge.

// Room on the sides for "Hamstrings" / "Shoulders", above and below for one line.
export function radarLayout(width: number): RadarLayout {
  const size = width - 32;
  const height = size * 0.8;
  const { labelRoomSide, labelRoomEnds } = STATISTICS_DISTRIBUTION_SIZES;
  return {
    size,
    height,
    cx: size / 2,
    cy: height / 2,
    radius: Math.min(size / 2 - labelRoomSide, height / 2 - labelRoomEnds),
  };
}

// The angle of spoke i of n, in radians (0 = right, so the first is -90°: up).
export function spokeAngle(i: number, n: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

// The point `value` along spoke i of n, the edge being `scale`.
export function radarPoint(layout: RadarLayout, i: number, n: number, value: number, scale: number): Point {
  const a = spokeAngle(i, n);
  const d = (layout.radius * Math.min(value, scale)) / scale;
  return [layout.cx + Math.cos(a) * d, layout.cy + Math.sin(a) * d];
}

// SVG polygon points through one value per spoke ("x,y x,y …").
export function radarPolygon(layout: RadarLayout, values: number[], scale: number): string {
  return values.map((v, i) => radarPoint(layout, i, values.length, v, scale).join(',')).join(' ');
}

// The web's rings: one every 2 sets up to the edge.
export function ringValues(scale: number): number[] {
  return Array.from({ length: scale / 2 }, (_, k) => (k + 1) * 2);
}

// A label left of the middle hangs left of its point, right of it hangs right.
export function labelAnchor(cos: number): LabelAnchor {
  return cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
}

// Labels below the middle drop a line, above it rise a little.
export function labelDy(sin: number): number {
  return sin > 0.3 ? 12 : sin < -0.3 ? -2 : 5;
}
