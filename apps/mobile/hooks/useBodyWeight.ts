import { useCallback, useEffect, useState } from 'react';
import { getBodyWeightContext } from '@/db/bodyWeight/bodyWeight';
import type { BodyWeightContext } from '@/types/bodyWeight';

// The last body weight logged and the exercises that count it, for the
// workout in progress (null while loading). `reload` after logging a new one.
export function useBodyWeight(): { bodyWeight: BodyWeightContext | null; reload: () => Promise<void> } {
  const [bodyWeight, setBodyWeight] = useState<BodyWeightContext | null>(null);
  const reload = useCallback(async () => {
    setBodyWeight(await getBodyWeightContext());
  }, []);
  useEffect(() => {
    let live = true;
    getBodyWeightContext()
      .then((context) => live && setBodyWeight(context))
      .catch((e) => console.warn('[body weight] load failed', e));
    return () => {
      live = false;
    };
  }, []);
  return { bodyWeight, reload };
}
