import type { HasId } from '@/types/misc';

// A handler that does nothing (a press with no action yet).
export function noop() {}

// FlatList keyExtractor for rows that carry their own id (the workout cards).
export function idKey(item: HasId): string {
  return item.id;
}
