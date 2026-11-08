import { useCallback, useEffect, useState } from 'react';

import { DataWaitingError, getDb } from '@/db/client';

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

  useEffect(() => {
    getDb().then(
      () => setMessage(null),
      (e) => {
        if (e instanceof DataWaitingError) setMessage(e.message);
        else console.warn('[db] open failed', e);
      }
    );
  }, []);

  const retry = useCallback(() => {
    setTrying(true);
    getDb()
      .then(
        () => setMessage(null),
        (e) => setMessage(e instanceof DataWaitingError ? e.message : STILL_CLOSED)
      )
      .finally(() => setTrying(false));
  }, []);

  return { message, trying, retry };
}
