import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { ICON_SIZES } from '@/constants/sizes';
import type { TabIconProps } from '@/types/ui';

// Tab bar icons: Home and Workout are drawn for Hevier; Profile is Lucide's
// user-round (ISC). Active tabs use a heavier stroke.

function Icon({ color, active, size, children }: TabIconProps & { size: number; children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={active ? 2.3 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export function HomeIcon(props: TabIconProps) {
  return (
    <Icon {...props} size={ICON_SIZES.huge}>
      <Path d="M2.2 11.2 12 3.3l9.8 7.9" />
      <Path d="M4.8 9.4V18.6a2.2 2.2 0 0 0 2.2 2.2h10a2.2 2.2 0 0 0 2.2-2.2V9.4" />
      <Path d="M10.3 20.8v-6.1a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v6.1" />
    </Icon>
  );
}

export function WorkoutIcon(props: TabIconProps) {
  return (
    <Icon {...props} size={ICON_SIZES.huge}>
      <Rect x={2.6} y={9} width={2.9} height={6} rx={1.2} />
      <Rect x={5.5} y={7} width={3.2} height={10} rx={1.3} />
      <Path d="M8.7 12h6.6" />
      <Rect x={15.3} y={7} width={3.2} height={10} rx={1.3} />
      <Rect x={18.5} y={9} width={2.9} height={6} rx={1.2} />
    </Icon>
  );
}

export function ProfileIcon(props: TabIconProps) {
  return (
    <Icon {...props} size={ICON_SIZES.xxxl}>
      <Circle cx={12} cy={8} r={5} />
      <Path d="M20 21a8 8 0 0 0-16 0" />
    </Icon>
  );
}
