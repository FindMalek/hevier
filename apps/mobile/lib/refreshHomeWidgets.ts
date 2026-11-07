import { groupColors, recoveryView } from '@/components/body/BodyFigure';
import { recoverySteps, widgetData } from './homeWidgets';
import { recovery, setEfforts, startMsOf } from '@/lib/training/effort';
import { getProfile } from '@/db/profile/profile';
import { getCycle } from '@/db/rotation/cycle';
import { getStatSets } from '@/db/stats/statSets';
import { updateHomeWidgets } from '@/modules/home-widgets';
import { MS_PER_DAY } from '@/constants/time';


// Sends the widgets fresh data (lib/homeWidgets.ts). Cheap: the
// sessions and sets come from the shared history cache.
export async function refreshHomeWidgets(): Promise<void> {
  try {
    const now = new Date();
    const [profile, cycle, sets] = await Promise.all([getProfile(), getCycle(), getStatSets()]);
    // Recovery looks back a week at most (lib/training/effort.ts).
    const recent = sets.filter((s) => now.getTime() - startMsOf(s) <= 8 * MS_PER_DAY);
    const efforts = setEfforts(recent);
    const steps = recoverySteps(
      (t) => Object.fromEntries(groupColors(recoveryView(recovery(recent, efforts, t)).shades)),
      now
    );
    updateHomeWidgets(widgetData(profile.sessions, cycle, steps, now));
  } catch (e) {
    console.warn('[homeWidgets] refresh failed', e);
  }
}
