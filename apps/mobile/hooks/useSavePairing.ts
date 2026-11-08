import { useRef, useState } from 'react';

import { savePairing } from '@/lib/sync/pairing';
import type { Pairing, SavePairingState } from '@/types/sync';

const SAVE_ERROR = 'Could not save the pairing. Try again.';

// Saves the PC the user confirmed in the Pair dialog (app/pair.tsx and
// app/sync-scan.tsx), then runs `onSaved`. A failed save leaves `error` for
// the dialog to show, and the user can tap Pair again.
export function useSavePairing(onSaved: () => void): SavePairingState {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A second tap on Pair before the screen re-renders would save twice.
  const busy = useRef(false);

  async function confirm(pairing: Pairing | null) {
    if (!pairing || busy.current) return;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      await savePairing(pairing);
      onSaved();
    } catch (e) {
      console.warn('[sync] could not save the pairing', e);
      setError(SAVE_ERROR);
      busy.current = false;
      setSaving(false);
    }
  }

  return { confirm, saving, error, clearError: () => setError(null) };
}
