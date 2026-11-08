import type { Pairing } from '@/types/sync';

export interface PairDialogProps {
  pairing: Pairing | null;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

// A pairing waiting for confirmation, with the PC this phone is paired with now.
export interface PairingWithCurrent {
  pairing: Pairing;
  current: Pairing | null;
}
