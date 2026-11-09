// Two dumbbells: one-arm moves are logged with the one dumbbell, so they get no switch.
export function canLogPerHand(name: string, equipment: string | null): boolean {
  return equipment === 'dumbbell' && !/single|one[ -]?arm|unilateral/i.test(name);
}
