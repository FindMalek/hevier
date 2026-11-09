import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MinusCircle } from 'phosphor-react-native/src/icons/MinusCircle';
import { PlusCircle } from 'phosphor-react-native/src/icons/PlusCircle';

import { HeaderTextButton, InnerHeader } from '@/components/ui/InnerHeader';
import { ReorderList } from '@/components/ui/ReorderList';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { getRotation, saveRotation } from '@/db/rotation/cycle';
import { getRoutineOverview } from '@/db/routines/folders';
import { HIT_SLOPS, LAYOUT, SPACE } from '@/constants/layout';
import { CYCLE_SIZES, ICON_SIZES } from '@/constants/sizes';
import type { ReorderItem } from '@/types/ui';
import { Screen } from '@/components/ui/Screen';

// The training cycle (db/rotation/cycle.ts): the routines done in turn, in order.
// Laid out like Reorder Folders. Tap ⊕ to add a routine at
// the end, ⊖ to take it out, ≡ to move it. Nothing is saved until Done; ←
// discards; Done with no routines turns the cycle off.
export default function CycleScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<{ id: string; name: string }[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getRoutineOverview(), getRotation()]).then(([o, saved]) => {
      const all = [...o.folders.flatMap((f) => f.routines), ...o.unfiled].map(({ id, name }) => ({ id, name }));
      const ids = new Set(all.map((r) => r.id));
      setRoutines(all);
      setOrder(saved.filter((id) => ids.has(id)));
    });
  }, []);

  const nameOf = useMemo(() => new Map(routines.map((r) => [r.id, r.name])), [routines]);
  const items = useMemo<ReorderItem[]>(
    () =>
      order.map((id, i) => ({
        id,
        label: `${i + 1}. ${nameOf.get(id) ?? ''}`,
        left: (
          <Pressable onPress={() => setOrder((o) => o.filter((x) => x !== id))} hitSlop={HIT_SLOPS.md}>
            <MinusCircle size={ICON_SIZES.xl} color={COLORS.danger} />
          </Pressable>
        ),
      })),
    [order, nameOf]
  );
  const others = useMemo(() => routines.filter((r) => !order.includes(r.id)), [routines, order]);

  async function done() {
    if (saving) return;
    setSaving(true);
    try {
      await saveRotation(order);
      router.back();
    } catch (e) {
      console.warn('Save cycle failed', e);
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Cycle" right={<HeaderTextButton label="Done" onPress={done} />} />

      <Text style={styles.section}>Order</Text>
      {order.length === 0 ? (
        <Text style={styles.hint}>Add the routines you do in turn. Home then shows which one is next.</Text>
      ) : (
        <ReorderList items={items} onChange={(next) => setOrder(next.map((i) => i.id))} />
      )}

      {others.length > 0 && <Text style={styles.section}>Add</Text>}
      {others.map((r, i) => (
        <Pressable
          key={r.id}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => setOrder((o) => [...o, r.id])}>
          {i > 0 && <View style={styles.divider} />}
          <PlusCircle size={ICON_SIZES.xl} color={COLORS.primary} />
          <Text style={styles.label} numberOfLines={1}>
            {r.name}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: SPACE.lg,
    marginBottom: SPACE.xs,
    paddingHorizontal: LAYOUT.screenMargin,
    ...TYPE.smallMedium,
    color: COLORS.textSecondary,
  },
  hint: {
    paddingHorizontal: LAYOUT.screenMargin,
    paddingVertical: SPACE.md,
    ...TYPE.callout,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
  // Same row as ReorderList's.
  row: {
    height: CYCLE_SIZES.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.screenMargin,
  },
  pressed: {
    opacity: 0.7,
  },
  divider: {
    position: 'absolute',
    top: 0,
    left: CYCLE_SIZES.dividerLeft,
    right: CYCLE_SIZES.dividerRight,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
  },
  label: {
    flex: 1,
    marginLeft: SPACE.md,
    ...TYPE.body,
  },
});
