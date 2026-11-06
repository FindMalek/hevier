// Domain padded by 10% of the range each side; ticks at 1/2/5 × 10^n steps.
export function scale(values: number[]) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (values.length === 0) [lo, hi] = [0, 1];
  const pad = hi > lo ? (hi - lo) * 0.1 : Math.max(Math.abs(hi) * 0.1, 1);
  const min = lo - pad;
  const max = hi + pad;
  const raw = (max - min) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const steps = [0.5, 1, 2, 5, 10].map((m) => m * magnitude);
  // The first 1/2/5 step at least a third of the range; a smaller one if
  // that leaves fewer than two grid lines.
  let i = steps.findIndex((s) => s >= raw);
  let ticks = ticksFor(min, max, steps[i]);
  while (ticks.length < 2 && i > 0) ticks = ticksFor(min, max, steps[--i]);
  return { min, max, ticks, step: steps[i] };
}

function ticksFor(min: number, max: number, step: number) {
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t < max; t += step) {
    if (t > min) ticks.push(t);
  }
  return ticks;
}
