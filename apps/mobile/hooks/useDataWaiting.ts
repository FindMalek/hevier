import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { DataWaitingError, getDb } from '@/db/client';
import { UNFINISHED_RESTORE_NOTICE, takeUnfinishedRestoreNotice } from '@/lib/sync/restoreNotice';

// A restore undone by this start (lib/sync/expoIO.ts) is told once.
async function tellUnfinishedRestore(): Promise<void> {
  try {
    if (await takeUnfinishedRestoreNotice()) Alert.alert(UNFINISHED_RESTORE_NOTICE.title, UNFINISHED_RESTORE_NOTICE.message);
  } catch (e) {
    console.warn('[sync] could not read the restore notice', e);
  }
}

const STILL_CLOSED = 'Your data could not be opened yet. Try again in a moment.';

// Opens the database once when the app starts. When it can't because data
// from an interrupted restore is still waiting to be put back (db/client.ts),
// `message` says so: without it every screen would look empty, as if the data
// were gone. `retry` asks again (each try runs the put-back once more) and
// `trying` is true while it does; a retry that fails for any other reason
// says so rather than leaving the old text up.
export function useDataWaiting(): { message: string | null; trying: boolean; retry: () => void } {
  const [message, setMessage] = useState<string | null>(null);
  const [trying, setTrying] = useState(false);

  // At start a failure for another reason is only logged: the app opens as it
  // always did. A retry is the user asking, so it answers either way.
  const tryOpen = useCallback((byUser: boolean) => {
    return getDb().then(
      () => {
        setMessage(null);
        void tellUnfinishedRestore();
      },
      (e) => {
        if (e instanceof DataWaitingError) setMessage(e.message);
        else if (byUser) setMessage(STILL_CLOSED);
        else console.warn('[db] open failed', e);
      }
    );
  }, []);

  useEffect(() => {
    void tryOpen(false);
  }, [tryOpen]);

  const retry = useCallback(() => {
    setTrying(true);
    void tryOpen(true).finally(() => setTrying(false));
  }, [tryOpen]);

  return { message, trying, retry };
}
