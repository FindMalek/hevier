import { MS_PER_MINUTE } from '@/constants/time';
import { startOfDay } from '@/lib/date';
import { plural } from '@/lib/format/text';
import { shortDate } from '@/lib/format/date';

// The workout cards' labels: when it was, and how long it took.

// "3 hours ago", "Yesterday", "Oct 6", "Oct 6, 2025": the card's time line.
export function timeAgo(iso: string, now = new Date()): string {
  const t = new Date(iso);
  const minutes = Math.floor((now.getTime() - t.getTime()) / MS_PER_MINUTE);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} ${plural(minutes, 'minute')} ago`;
  const hours = Math.floor(minutes / 60);
  if (t >= startOfDay(now)) return `${hours} ${plural(hours, 'hour')} ago`;
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (t >= startOfYesterday) return 'Yesterday';
  return shortDate(t, now);
}

// "Today", "Yesterday", "Oct 6": the Profile's cards (Home says "3 hours ago").
export function dayLabel(iso: string, now = new Date()): string {
  const t = new Date(iso);
  if (t >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) return 'Today';
  return timeAgo(iso, now);
}

// "1h 9min", "45min"
export function durationLabel(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes}min`;
}
