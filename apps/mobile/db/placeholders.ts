// "?, ?, ?": one SQL placeholder per value, for an IN (…) list whose length changes.
export function marks(count: number): string {
  return Array.from({ length: count }, () => '?').join(', ');
}
