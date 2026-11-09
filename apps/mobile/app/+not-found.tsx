import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { COLORS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          Go to home screen
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: SPACE.lg },
  title: { ...TYPE.headingSemibold },
  link: { marginTop: SPACE.lg, paddingVertical: SPACE.lg, ...TYPE.small, color: COLORS.primary },
});
