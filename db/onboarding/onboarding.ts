import { STORAGE_KEYS } from '@/constants/storage';
import { getString, setString } from '@/db/appState/appState';
import { getDb } from '@/db/client';
import { addBodyWeight } from '@/db/bodyWeight/bodyWeight';
import { saveProfileNames } from '@/db/profile/names';
import { usernameFrom } from '@/lib/domain/profile';
import { setDrawings } from '@/stores/drawings';
import type { OnboardingAnswers } from '@/types/profile';
import { SELECT_ANY_WORKOUT } from './queries';
import type { FoundRow } from './rows';

// The first-launch questions (app/onboarding.tsx): asked once, on a fresh
// install with nothing logged yet.

export async function needsOnboarding(): Promise<boolean> {
  if (await getString(STORAGE_KEYS.onboardingDone)) return false;
  const db = await getDb();
  return !(await db.getFirstAsync<FoundRow>(SELECT_ANY_WORKOUT));
}

// Saves what was answered (skipped ones stay as they were) and never asks again.
export async function finishOnboarding(answers: OnboardingAnswers): Promise<void> {
  if (answers.name) await saveProfileNames(answers.name, usernameFrom(answers.name));
  if (answers.drawings) await setDrawings(answers.drawings);
  if (answers.bodyWeightKg) await addBodyWeight(answers.bodyWeightKg);
  await setString(STORAGE_KEYS.onboardingDone, '1');
}
