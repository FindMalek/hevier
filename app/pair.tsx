import { useEffect, useMemo, useRef } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PairDialog } from '@/components/sync/PairDialog';
import { parsePairLink, savePairing } from '@/lib/sync/pairing';
import { Screen } from '@/components/ui/Screen';

// hevier://pair?host=…&port=…&key=… (adb for the emulator, or any link): asks
// before remembering the PC, then shows the Sync screen.
export default function Pair() {
  const router = useRouter();
  const { host, port, key } = useLocalSearchParams<{ host?: string; port?: string; key?: string }>();
  const pairing = useMemo(() => parsePairLink(`hevier://pair?host=${host ?? ''}&port=${port ?? ''}&key=${key ?? ''}`), [host, port, key]);

  const saving = useRef(false);

  useEffect(() => {
    if (!pairing) router.replace('/sync');
  }, [pairing, router]);

  async function confirm() {
    if (saving.current) return;
    saving.current = true;
    try {
      await savePairing(pairing!);
      router.replace('/sync');
    } catch (e) {
      console.warn('[sync] could not save the pairing', e);
      saving.current = false;
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <PairDialog pairing={pairing} onConfirm={confirm} onCancel={() => !saving.current && router.replace('/sync')} />
    </Screen>
  );
}
