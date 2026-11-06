// Pure list changes shared by Log Workout and the editors. Every item has a
// key (a string in Log Workout, a number in the editors).

// `list` with the item keyed `key` replaced by `change(item)`.
export function updateByKey<T extends { key: K }, K>(list: T[], key: K, change: (item: T) => T): T[] {
  return list.map((item) => (item.key === key ? change(item) : item));
}

// `sets` with the set keyed `key` given the new values in `change`.
export function patchSet<S extends { key: K }, K>(sets: S[], key: K, change: Partial<S>): S[] {
  return updateByKey(sets, key, (s) => ({ ...s, ...change }));
}

// `list` without the item keyed `key`.
export function removeByKey<T extends { key: K }, K>(list: T[], key: K): T[] {
  return list.filter((item) => item.key !== key);
}
