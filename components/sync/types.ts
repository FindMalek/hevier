import type { Pairing } from '@/types/sync';

export interface PairDialogProps {
  pairing: Pairing | null;
  onConfirm: () => void;
  onCancel: () => void;
}
