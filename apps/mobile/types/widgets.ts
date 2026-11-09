// The home screen widgets' data (modules/home-widgets, lib/homeWidgets.ts).

export interface WidgetData {
  days: string[]; // local days with a workout ("2026-10-30"), from the 1st of last month
  volume: Record<string, number>; // kg per local day, from the Monday of last week
  cycle: { name: string; step: number; total: number; exercises: string[] } | null;
  // The Recovery body's colours (MuscleMap group → colour) from each time on,
  // oldest first: the widget shows the last step that has started.
  recovery: RecoveryStep[];
}

export interface RecoveryStep {
  at: number; // epoch ms
  colors: Record<string, string>;
}
