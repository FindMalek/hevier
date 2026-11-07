import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { pairMessage } from '@/lib/sync/format';
import { isLocalHost } from '@/lib/sync/pairing';
import type { PairDialogProps } from './types';

// Asks before a PC address from a scanned or opened link is remembered.
export function PairDialog({ pairing, onConfirm, onCancel }: PairDialogProps) {
  const local = !!pairing && isLocalHost(pairing.host);
  return (
    <ConfirmDialog
      visible={!!pairing}
      message={pairing ? pairMessage(pairing, local) : ''}
      confirmLabel={local ? 'Pair' : 'Pair anyway'}
      tone={local ? 'primary' : 'danger'}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
