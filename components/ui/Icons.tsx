import Svg, { Path } from 'react-native-svg';
import type { FolderAddIconProps } from './types';

// Small icons drawn for Hevier where no icon set matched.

// "New folder" beside the Routines title: one rounded outline whose tab flows
// into the body (21x19dp), with a + low in the body.
export function FolderAddIcon({ color, size = 24.8 }: FolderAddIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2.5 5.9a2.1 2.1 0 0 1 2.1-2.1h4.7a1.6 1.6 0 0 1 1.25.6l1.5 1.9a1.6 1.6 0 0 0 1.25.6h6.1a2.1 2.1 0 0 1 2.1 2.1v9.7a2.1 2.1 0 0 1-2.1 2.1H4.6a2.1 2.1 0 0 1-2.1-2.1Z" />
      <Path d="M12 10.7v6M9 13.7h6" />
    </Svg>
  );
}
