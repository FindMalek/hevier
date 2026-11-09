import type { Drawings } from '@/types/profile';

export interface StepHeaderProps {
  step: number;
  steps: number;
  onSkip: () => void;
}

export interface DrawingsChoiceProps {
  value: Drawings | null;
  onChange: (value: Drawings) => void;
}
