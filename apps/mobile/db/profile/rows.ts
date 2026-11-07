// What the Profile tab's queries return.

// SELECT_PROFILE_SESSIONS
export interface ProfileSessionRow {
  start_time: string;
  end_time: string | null;
  volume: number;
  reps: number;
}
