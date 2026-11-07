import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';

import { InnerHeader } from '@/components/ui/InnerHeader';
import { PairDialog } from '@/components/sync/PairDialog';
import { parsePairLink, savePairing } from '@/lib/sync/pairing';
import type { Pairing } from '@/types/sync';
import { COLORS, LINE_HEIGHTS, TYPE, withAlpha } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import { SYNC_SCAN_RETRY_MS } from '@/constants/motion';
import { SYNC_SCAN_SIZES } from '@/constants/sizes';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';

// Scans the QR code in the Hevier Sync window on the PC, asks to pair with the
// PC it shows, then goes back to the Sync screen.
export default function SyncScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [wrongCode, setWrongCode] = useState(false);
  const [found, setFound] = useState<Pairing | null>(null);
  const done = useRef(false);
  const saving = useRef(false);
  const lastCode = useRef('');
  const refused = useRef({ code: '', until: 0 });

  function scanned(data: string) {
    if (done.current) return;
    if (data === refused.current.code && Date.now() < refused.current.until) return;
    const pairing = parsePairLink(data);
    if (!pairing) {
      setWrongCode(true);
      return;
    }
    done.current = true;
    lastCode.current = data;
    setFound(pairing);
  }

  async function confirm() {
    if (saving.current) return;
    saving.current = true;
    try {
      await savePairing(found!);
      router.back();
    } catch (e) {
      console.warn('[sync] could not save the pairing', e);
      saving.current = false;
    }
  }

  function cancel() {
    if (saving.current) return;
    refused.current = { code: lastCode.current, until: Date.now() + SYNC_SCAN_RETRY_MS };
    setFound(null);
    done.current = false;
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Scan QR Code" />
      {permission?.granted ? (
        <View style={styles.cameraBox}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => scanned(data)}
          />
          <View style={styles.frame} />
          <Text style={styles.hint}>{wrongCode ? "This isn't a Hevier Sync code." : 'Point at the QR code in the Hevier Sync window.'}</Text>
        </View>
      ) : (
        permission && (
          <View style={styles.body}>
            <Text style={styles.intro}>Hevier needs the camera to scan the QR code on your PC.</Text>
            <Button label="Allow Camera" onPress={requestPermission} />
          </View>
        )
      )}
      <PairDialog pairing={found} onConfirm={confirm} onCancel={cancel} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: SYNC_SCAN_SIZES.frameWidth,
    height: SYNC_SCAN_SIZES.frameHeight,
    borderRadius: RADIUS.xxl,
    borderWidth: BORDER_WIDTHS.thick,
    borderColor: COLORS.text,
  },
  hint: {
    position: 'absolute',
    bottom: SYNC_SCAN_SIZES.hintBottom,
    left: SYNC_SCAN_SIZES.hintLeft,
    right: SYNC_SCAN_SIZES.hintRight,
    textAlign: 'center',
    ...TYPE.bodyMedium,
    textShadowColor: withAlpha(COLORS.black, 0.8),
    textShadowRadius: 4,
  },
  body: {
    padding: SPACE.lg,
    gap: SPACE.lg,
  },
  intro: {
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
});
