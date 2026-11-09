import { PROFILE_DEFAULTS } from '@/constants/profile';

// A @username made from a name: lowercase letters and digits only.
export function usernameFrom(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return base || PROFILE_DEFAULTS.username;
}
