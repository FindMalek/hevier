// Volume (weight lifted): weight × reps per set, added up. The one rule every
// screen uses: workout cards, Profile, the routine page, statistics, records,
// the exercise charts and the workout in progress.
//
// Body weight exercises (pull-ups, dips…) log no weight: their sets count the
// body weight logged at the time of the workout (the database hands it over
// with each set, db/bodyWeight/queries.ts SET_BODY_WEIGHT). A set with neither
// counts 0.
export function setVolumeKg(weightKg: number | null | undefined, reps: number | null | undefined, bodyWeightKg?: number | null): number {
  return (weightKg ?? bodyWeightKg ?? 0) * (reps ?? 0);
}
