// The value, or the fallback when it's NaN or ±Infinity.
export function finiteOr(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}
