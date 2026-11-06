import { Image, StyleSheet, Text, View } from 'react-native';

import { useProfilePhoto } from '@/stores/profilePhoto';
import { COLORS, FONTS } from '@/constants/theme';
import type { AvatarProps } from './types';

// The user's picture (tap it on Profile to choose one), else the name's
// initial on a grey circle. resizeMethod="resize" decodes the photo at the
// circle's size, not the camera's, for the feed's many small avatars.
export function Avatar({ name, size }: AvatarProps) {
  const photo = useProfilePhoto();
  const circle = { width: size, height: size, borderRadius: size / 2 };
  if (photo) return <Image source={{ uri: photo }} style={[styles.circle, circle]} resizeMethod="resize" />;
  return (
    <View style={[styles.circle, circle]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  initial: {
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
});
