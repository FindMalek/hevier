import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { Barbell } from 'phosphor-react-native/src/icons/Barbell';

import { COLORS } from '@/constants/theme';
import { STORAGE_FOLDERS } from '@/constants/storage';
import type { ExerciseThumbProps } from './types';

// Round exercise picture: a white circle with the still.
// Stills are copied to the device by scripts/load-device.sh
// (files/catalogue/still/<catalogue id>.webp); custom exercises without one
// get a plain circle with a barbell.
export const ExerciseThumb = memo(function ExerciseThumb({
  catalogueId,
  size = 40,
}: ExerciseThumbProps) {
  const uri = catalogueId ? stillUri(catalogueId) : null;
  const circle = { width: size, height: size, borderRadius: size / 2 };
  if (!uri) {
    return (
      <View style={[styles.placeholder, circle]}>
        <Barbell size={size * 0.55} color={COLORS.textSecondary} />
      </View>
    );
  }
  return (
    <View style={[styles.picture, circle]}>
      <Image source={{ uri }} style={circle} resizeMode="cover" />
    </View>
  );
});

// Looked up once per exercise: File.exists is a synchronous disk check, too
// slow to repeat on every render of a long list. The stills only change when
// scripts/load-device.sh copies them, which restarts the app.
const stills = new Map<string, string | null>();

export function stillUri(catalogueId: string): string | null {
  let uri = stills.get(catalogueId);
  if (uri === undefined) {
    const file = new File(Paths.document, STORAGE_FOLDERS.catalogue, 'still', `${catalogueId}.webp`);
    uri = file.exists ? file.uri : null;
    stills.set(catalogueId, uri);
  }
  return uri;
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  picture: {
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
});
