import { useEffect } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { parsePairLink, savePairing } from '@/lib/sync/pairing';
import { Screen } from '@/components/ui/Screen';

// hevier://pair?host=…&port=…&key=… (the QR in the Hevier Sync window, or
// adb for the emulator): remember the PC, then show the Sync screen.
export default function Pair() {
  const router = useRouter();
  const { host, port, key } = useLocalSearchParams<{ host?: string; port?: string; key?: string }>();

  useEffect(() => {
    const pairing = parsePairLink(`hevier://pair?host=${host ?? ''}&port=${port ?? ''}&key=${key ?? ''}`);
    (pairing ? savePairing(pairing) : Promise.resolve()).then(() => router.replace('/sync'));
  }, [host, port, key, router]);

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
    </Screen>
  );
}
