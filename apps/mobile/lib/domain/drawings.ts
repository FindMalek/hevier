import { FEMALE_DRAWINGS } from '@/constants/femaleDrawings';
import type { Drawings } from '@/types/profile';

// The media id (still/clip file name) of an exercise for the chosen figure:
// its female drawing when there is one, else its own.
export function mediaIdFor(catalogueId: string, drawings: Drawings): string {
  return (drawings === 'female' && FEMALE_DRAWINGS[catalogueId]) || catalogueId;
}
