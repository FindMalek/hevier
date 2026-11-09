import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { totalText, weightBoxText } from '@/lib/format/setFormat';
import { useSelectAllOnFocus } from '@/hooks/useSelectAllOnFocus';

// The KG box. Per hand it shows and takes one dumbbell and hands back the
// total; what was typed is kept while it still matches, so "12." or "12,"
// stays on screen until the next digit.
export function WeightInput({
  value,
  perHand,
  onChangeText,
  ...props
}: Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value: string; // the total
  perHand: boolean;
  onChangeText: (total: string) => void;
}) {
  const [typed, setTyped] = useState<string | null>(null);
  const shown = weightBoxText(value, typed, perHand);
  const { ref, onFocus } = useSelectAllOnFocus(shown);
  return (
    <TextInput
      {...props}
      ref={ref}
      onFocus={onFocus}
      value={shown}
      onChangeText={(text) => {
        if (!perHand) return onChangeText(text);
        setTyped(text);
        onChangeText(totalText(text));
      }}
    />
  );
}
