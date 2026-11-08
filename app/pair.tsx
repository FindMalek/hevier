import { useEffect, useMemo } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PairDialog } from '@/components/sync/PairDialog';
import { useSavePairing } from '@/hooks/useSavePairing';
import { parsePairLink } from '@/lib/sync/pairing';
import { Screen } from '@/components/ui/Screen';

// hevier://pair?host=…&port=…&key=… (adb for the emulator, or any link): asks
// before remembering the PC, then shows the Sync screen.
export default function Pair() {
  const router = useRouter();
  const { host, port, key } = useLocalSearchParams<{ host?: string; port?: string; key?: string }>();
  const pairing = useMemo(() => parsePairLink(`hevier://pair?host=${host ?? ''}&port=${port ?? ''}&key=${key ?? ''}`), [host, port, key]);
  const { confirm, saving } = useSavePairing(() => router.replace('/sync'));

  useEffect(() => {
    if (!pairing) router.replace('/sync');
  }, [pairing, router]);

  function cancel() {
    if (saving) return;
    router.replace('/sync');
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <PairDialog pairing={pairing} onConfirm={() => confirm(pairing)} onCancel={cancel} />
    </Screen>
  );
}
