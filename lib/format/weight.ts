import { KG_PER_THOUSAND, SHORT_VOLUME_FROM_KG } from '@/constants/weight';

// "1,000 kg"
export function volumeLabel(kg: number): string {
  return `${Math.round(kg).toLocaleString('en-US')} kg`;
}

// "19k kg"
export function thousandsLabel(kg: number): string {
  return `${Math.round(kg / KG_PER_THOUSAND)}k kg`;
}

// "19k kg" from SHORT_VOLUME_FROM_KG up, else "800 kg".
export function shortVolumeLabel(kg: number): string {
  return Math.abs(kg) >= SHORT_VOLUME_FROM_KG ? thousandsLabel(kg) : volumeLabel(kg);
}

// "106.67", "2.5", "100": at most two decimals, no trailing zeros.
export function round2(n: number): string {
  return String(Number(n.toFixed(2)));
}
