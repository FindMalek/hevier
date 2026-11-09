import { useCallback, useRef } from 'react';
import type { TextInput } from 'react-native';

// Tapping a set box selects what's in it, so typing replaces it. Done once
// here rather than with selectTextOnFocus: Android re-selects the text when
// the keyboard finishes opening, so the second key typed replaced the first
// ("3" then "5" gave "5").
export function useSelectAllOnFocus(text: string) {
  const ref = useRef<TextInput>(null);
  const onFocus = useCallback(() => ref.current?.setSelection(0, text.length), [text]);
  return { ref, onFocus };
}
