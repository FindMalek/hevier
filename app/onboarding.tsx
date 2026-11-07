import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { DrawingsChoice } from '@/components/onboarding/DrawingsChoice';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { finishOnboarding } from '@/db/onboarding/onboarding';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { parseBodyWeight } from '@/lib/domain/bodyWeight';
import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { ONBOARDING_SIZES } from '@/constants/sizes';
import type { Drawings } from '@/types/profile';

// First launch on a fresh install (db/onboarding): name, which figure the
// exercise pictures show, body weight. Each can be skipped; nothing is saved
// until the end, and it never shows again.

const STEPS = [
  { title: "What's your name?", hint: 'Shown on your profile. You can change it in Edit Profile.' },
  {
    title: 'Exercise pictures',
    hint: 'Show the exercises on a male or a female figure. Only the pictures change. You can switch in Settings.',
  },
  {
    title: 'Your body weight',
    hint: 'Body weight exercises like pull-ups and dips count it in their volume. Update it in Profile → Body weight.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [drawings, setDrawings] = useState<Drawings | null>(null);
  const [weight, setWeight] = useState('');
  const [busy, setBusy] = useState(false);

  const last = step === STEPS.length - 1;
  const weightKg = parseBodyWeight(weight);
  const answered = [name.trim() !== '', drawings !== null, weightKg !== null][step];

  async function finish(skipCurrent: boolean) {
    setBusy(true);
    await finishOnboarding({
      name: name.trim() || null,
      drawings,
      bodyWeightKg: skipCurrent ? null : weightKg,
    });
    router.back(); // Home reloads the name when it shows again
  }

  function next(skipCurrent = false) {
    if (skipCurrent) {
      if (step === 0) setName('');
      if (step === 1) setDrawings(null);
    }
    if (last) finish(skipCurrent);
    else setStep(step + 1);
  }

  return (
    <Screen style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, keyboard) + SPACE.lg }}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
      <StepHeader step={step} steps={STEPS.length} onSkip={() => next(true)} />
      <View style={styles.body}>
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.hint}>{STEPS[step].hint}</Text>
        {step === 0 && (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={COLORS.textSecondary}
            autoFocus
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => answered && next()}
          />
        )}
        {step === 1 && <DrawingsChoice value={drawings} onChange={setDrawings} />}
        {step === 2 && (
          <View style={styles.weightRow}>
            <TextInput
              style={[styles.input, styles.weightInput]}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad"
              autoFocus
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        )}
      </View>
      <Button
        label={last ? 'Done' : 'Continue'}
        disabled={!answered}
        busy={busy}
        onPress={() => next()}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenMargin,
    paddingTop: SPACE.xxl,
  },
  title: {
    ...TYPE.headlineBold,
  },
  hint: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    marginTop: SPACE.sm,
    marginBottom: SPACE.xl,
  },
  input: {
    height: ONBOARDING_SIZES.inputHeight,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACE.lg,
    ...TYPE.title,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
  },
  weightInput: {
    flex: 1,
  },
  unit: {
    ...TYPE.title,
    color: COLORS.textSecondary,
  },
  button: {
    marginHorizontal: LAYOUT.screenMargin,
  },
});
