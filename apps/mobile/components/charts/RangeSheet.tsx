import { BottomSheet, SheetOption } from '@/components/ui/BottomSheet';
import type { RangeSheetProps } from './types';

// The bottom sheet listing a chart's ranges, the shown one ticked.
export function RangeSheet({ visible, ranges, range, onPick, onDismiss }: RangeSheetProps) {
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      {ranges.map((option, i) => (
        <SheetOption
          key={option.label}
          first={i === 0}
          label={option.label}
          selected={i === range}
          onPress={() => {
            onPick(i);
            onDismiss();
          }}
        />
      ))}
    </BottomSheet>
  );
}
