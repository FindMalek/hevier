import { useRef, useState } from 'react';

import { savePairing } from '@/lib/sync/pairing';
import type { Pairing, SavePairingState } from '@/types/sync';

// Saves the PC the user confirmed in the Pair dialog (app/pair.tsx and
// app/sync-scan.tsx), then runs `onSaved`.
export function useSavePairing(onSaved: () => void): SavePairingState {
  const [saving, setSaving] = useState(false);
  // A second tap on Pair before the screen re-renders would save twice.
  const busy = useRef(false);

  async function confirm(pairing: Pairing | null) {
    if (!pairing || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await savePairing(pairing);
      onSaved();
    } catch (e) {
      console.warn('[sync] could not save the pairing', e);
      busy.current = false;
      setSaving(false);
    }
  }

  return { confirm, saving };
}
