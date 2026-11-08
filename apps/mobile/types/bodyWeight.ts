// A body weight logged on Profile → Body weight.
export interface BodyWeightEntry {
  id: string;
  loggedAt: string; // ISO time
  weightKg: number;
}

// What a workout in progress needs to count body weight exercises: the last
// weight logged (null = none yet) and which exercises count it.
export interface BodyWeightContext {
  weightKg: number | null;
  exerciseIds: Set<string>;
}

// How the weight moved over the chart's period: last minus first weight in it.
export interface BodyWeightChange {
  deltaKg: number; // + gained, - lost
  since: string; // ISO time of the first weight in the period
}
