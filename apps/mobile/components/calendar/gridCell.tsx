import { G, Rect } from 'react-native-svg';

import { COLORS } from '@/constants/theme';

// One square of the Year / Multi-year grids: blue if trained, grey if not.
// Today gets a white ring drawn inside the square, as the Views' 1-wide border did.
// A plain function, not a component: a year draws ~400 of them.
export function gridCell(key: number, x: number, y: number, size: number, radius: number, trained: Set<number>, today: number) {
  const fill = trained.has(key) ? COLORS.primary : COLORS.separator;
  if (key !== today) return <Rect key={key} x={x} y={y} width={size} height={size} rx={radius} fill={fill} />;
  return (
    <G key={key}>
      <Rect x={x} y={y} width={size} height={size} rx={radius} fill={fill} />
      <Rect
        x={x + 0.5}
        y={y + 0.5}
        width={size - 1}
        height={size - 1}
        rx={Math.max(0, radius - 0.5)}
        fill="none"
        stroke={COLORS.text}
        strokeWidth={1}
      />
    </G>
  );
}
