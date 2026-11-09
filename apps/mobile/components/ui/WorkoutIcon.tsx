import Svg, { Path, Rect } from 'react-native-svg';
import { ICON_SIZES } from '@/constants/sizes';

// The dumbbell drawn for Hevier (Profile's "Exercises" tile). The tab bar
// shows the same shape as an Android picture (plugins/android-res/drawable/tab_workout.xml).
export function WorkoutIcon({ color }: { color: string }) {
  return (
    <Svg
      width={ICON_SIZES.huge}
      height={ICON_SIZES.huge}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x={2.6} y={9} width={2.9} height={6} rx={1.2} />
      <Rect x={5.5} y={7} width={3.2} height={10} rx={1.3} />
      <Path d="M8.7 12h6.6" />
      <Rect x={15.3} y={7} width={3.2} height={10} rx={1.3} />
      <Rect x={18.5} y={9} width={2.9} height={6} rx={1.2} />
    </Svg>
  );
}
