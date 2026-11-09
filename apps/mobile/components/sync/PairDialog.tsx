import { useEffect, useState } from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { pairMessage } from '@/lib/sync/format';
import { getPairing, isLocalHost } from '@/lib/sync/pairing';
import type { PairDialogProps, PairingWithCurrent } from './types';

// Asks before a PC address from a scanned or opened link is remembered. It
// opens once the PC this phone is paired with is read, so the message can say
// it will be replaced.
export function PairDialog({ pairing, error, onConfirm, onCancel }: PairDialogProps) {
  const [loaded, setLoaded] = useState<PairingWithCurrent | null>(null);

  useEffect(() => {
    if (!pairing) return;
    void getPairing()
      .catch((e) => {
        console.warn('[sync] could not read the current pairing', e);
        return null;
      })
      .then((current) => setLoaded({ pairing, current }));
  }, [pairing]);

  const ready = !!pairing && loaded?.pairing === pairing;
  const local = !!pairing && isLocalHost(pairing.host);
  const question = ready ? pairMessage(pairing, local, loaded.current) : '';
  return (
    <ConfirmDialog
      visible={ready}
      message={error ? `${error}\n\n${question}` : question}
      confirmLabel={local ? 'Pair' : 'Pair anyway'}
      tone={local ? 'primary' : 'danger'}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
