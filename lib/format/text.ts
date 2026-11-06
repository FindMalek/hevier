// The word for a count: "set" for 1, "sets" otherwise ("1 set", "2 sets", "0 sets").
// Irregular words pass their plural: plural(n, 'match', 'matches').
export function plural(count: number, word: string, many = `${word}s`): string {
  return count === 1 ? word : many;
}
