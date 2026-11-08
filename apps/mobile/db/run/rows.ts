// What the run readiness queries return.

// SELECT_CHECK_IN
export interface CheckInRow {
  date: string;
  feel: string | null;
  sleep_hours: number | null;
  legs_sore: number;
  pain: number;
  sick: number;
}
