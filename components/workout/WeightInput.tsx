import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { perHandText, totalText } from '@/lib/format/setFormat';

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
  const shown = !perHand ? value : typed !== null && totalText(typed) === totalText(value) ? typed : perHandText(value);
  return (
    <TextInput
      {...props}
      value={shown}
      onChangeText={(text) => {
        if (!perHand) return onChangeText(text);
        setTyped(text);
        onChangeText(totalText(text));
      }}
    />
  );
}
