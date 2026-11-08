import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { reloadAppAsync } from 'expo';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';

import type { Manifest } from '@/shared/sync-types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InnerHeader } from '@/components/ui/InnerHeader';
import { fetchStatus, getLastRefusal, onRefusalChange, overUsb, syncNow } from '@/lib/sync/client';
import { expoIO } from '@/lib/sync/expoIO';
import { lastSyncedLabel, restoreMessage, syncMessage } from '@/lib/sync/format';
import { getLastSynced, getPairing } from '@/lib/sync/pairing';
import { isSyncBusy } from '@/lib/sync/lock';
import { restoreFromPc } from '@/lib/sync/restore';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, SIZES } from '@/constants/sizes';
import type { Pairing, SyncResult } from '@/types/sync';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';

// Settings → Sync with PC:
// pair with the Hevier Sync window by its QR code, then Sync now (Wi-Fi) or
// Sync over USB cable. A copy also goes by itself over Wi-Fi when the app
// opens (app/_layout.tsx); a refusal from that shows here.
export default function SyncScreen() {
  const router = useRouter();
  const [pairing, setPairing] = useState<Pairing | null | undefined>(undefined);
  const [last, setLast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [usb, setUsb] = useState(false); // the last sync went over the cable (its retry does too)
  const [note, setNote] = useState<string | null>(null); // restore messages
  const [backup, setBackup] = useState<Manifest | null>(null); // asking to restore it

  useFocusEffect(
    useCallback(() => {
      getPairing().then(setPairing);
      getLastSynced().then(setLast);
      setResult(getLastRefusal());
      // A quiet sync refused (or done) while this screen is open.
      return onRefusalChange((r) => {
        setResult(r);
        getLastSynced().then(setLast);
      });
    }, [])
  );

  async function sync(force = false, cable = usb) {
    if (!pairing) return;
    setBusy(true);
    setUsb(cable);
    setResult(null);
    setNote(null);
    const r = await syncNow(expoIO, { force, pairing: cable ? overUsb(pairing) : pairing });
    setResult(r);
    if (r.ok) setLast(r.at);
    setBusy(false);
  }

  const scan = () => router.push('/sync-scan');

  // Shows what the PC holds, then asks before replacing anything.
  async function askRestore() {
    if (!pairing || busy) return;
    setNote(null);
    if (isSyncBusy()) {
      setResult({ ok: false, reason: 'busy' });
      return;
    }
    setBusy(true);
    setResult(null);
    const status = await fetchStatus(pairing);
    setBusy(false);
    if ('ok' in status) setResult(status);
    else if (!status.backup) setNote("There's no backup on this PC yet.");
    else setBackup(status.backup);
  }

  async function restore() {
    setBackup(null);
    setBusy(true);
    let r: Awaited<ReturnType<typeof restoreFromPc>>;
    try {
      r = await restoreFromPc(expoIO, pairing!);
    } catch (e) {
      console.warn('[sync] restore threw', e);
      setBusy(false);
      setNote('Restore failed. Try again.');
      return;
    }
    if (r.ok) {
      await reloadAppAsync();
      return;
    }
    setBusy(false);
    if (r.reason === 'error') setNote("Restore failed. Your phone's data was not changed.");
    else setResult(r);
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Sync with PC" />
      {pairing === null && (
        <View style={styles.body}>
          <Text style={styles.intro}>Open Hevier Sync on your PC, then scan its QR code.</Text>
          <Button label="Pair with PC" onPress={scan} />
        </View>
      )}
      {pairing && (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Last synced</Text>
              <Text style={styles.value}>{lastSyncedLabel(last)}</Text>
            </View>
            <View style={[styles.cardRow, styles.cardDivider]}>
              <Text style={styles.label}>PC</Text>
              <Text style={styles.value}>{pairing.host}</Text>
            </View>
          </View>

          <Button label="Sync now" busy={busy} onPress={() => sync(false, false)} />
          <Button label="Sync over USB cable" variant="outline" size="compact" disabled={busy} onPress={() => sync(false, true)} />

          {result && (
            <View style={styles.result}>
              <Text style={[styles.message, result.ok && styles.messageOk]}>{syncMessage(result, usb)}</Text>
              {!result.ok && (result.reason === 'fewer' || result.reason === 'older') && <Button label="Send anyway" variant="outline" size="compact" onPress={() => sync(true)} />}
              {!result.ok && result.reason === 'otherDevice' && <Button label="Replace" variant="outline" size="compact" onPress={() => sync(true)} />}
            </View>
          )}

          {note && <Text style={styles.message}>{note}</Text>}

          <View style={styles.rows}>
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={scan}>
              <Text style={styles.rowTitle}>Pair again</Text>
              <CaretRight size={ICON_SIZES.md} color={COLORS.textSecondary} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.row, styles.rowDivider, pressed && styles.pressed]} onPress={askRestore}>
              <Text style={[styles.rowTitle, styles.danger]}>Restore from PC</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
      <ConfirmDialog
        visible={!!backup}
        message={backup ? restoreMessage(backup) : ''}
        confirmLabel="Restore"
        onConfirm={restore}
        onCancel={() => setBackup(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: SPACE.lg,
    gap: SPACE.lg,
  },
  intro: {
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
  card: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  cardRow: {
    height: SIZES.formRowHeight,
    paddingHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  label: {
    flex: 1,
    ...TYPE.row,
  },
  value: {
    ...TYPE.row,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
  result: {
    gap: SPACE.md,
  },
  message: {
    ...TYPE.callout,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.danger,
  },
  messageOk: {
    color: COLORS.textSecondary,
  },
  rows: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  row: {
    height: SIZES.formRowHeight,
    paddingHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  danger: {
    color: COLORS.danger,
  },
  rowTitle: {
    flex: 1,
    ...TYPE.row,
  },
});
