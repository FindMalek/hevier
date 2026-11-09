// The skip saved in app_state (STORAGE_KEYS.rotationSkip).
export interface Skip {
  id: string; // the routine shown next
  after: string | null; // start time of the newest cycle workout when skipped
}
