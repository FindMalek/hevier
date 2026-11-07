import type { ReactNode } from 'react';

import type { Profile, ProfileSession } from '@/types/profile';

// Props and local types of the Profile tab pieces (components/profile/).

export interface ProfileHeaderProps {
  profile: Profile;
  now: number; // "today", refreshed on every visit
  onAvatar: () => void;
}

export interface ProfileChartProps {
  sessions: ProfileSession[];
  now: number;
}

export interface TileProps {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  soon?: boolean; // not built yet: a "Coming soon" badge and no tap
}
