import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { needsOnboarding } from '@/db/onboarding/onboarding';

// Opens the first-launch questions over Home on a fresh install (once).
export function useOnboardingGate(): void {
  const router = useRouter();
  useEffect(() => {
    needsOnboarding()
      .then((needed) => needed && router.push('/onboarding'))
      .catch((e) => console.warn('[onboarding] check failed', e));
  }, [router]);
}
