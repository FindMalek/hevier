import { X } from 'phosphor-react-native/src/icons/X';
import { BottomSheet, SheetItem, SheetOption, sheetIcon } from '@/components/ui/BottomSheet';
import { COLORS } from '@/constants/theme';
import { ICON_SIZES } from '@/constants/sizes';
import { SET_TYPE_LABELS } from '@/constants/labels';
import { SET_TYPES } from '@/constants/workout';
import type { SetTypeSheetProps } from './types';

// Tapping a set's badge: Warm Up / Normal / Failure, and Remove Set.
export function SetTypeSheet({ visible, value, onPick, onRemove, onDismiss }: SetTypeSheetProps) {
  return (
    <BottomSheet visible={visible} title="Set Type" onDismiss={onDismiss}>
      {SET_TYPES.map((t, i) => (
        <SheetOption
          key={t}
          first={i === 0}
          label={SET_TYPE_LABELS[t]}
          selected={value === t}
          onPress={() => {
            onPick(t);
            onDismiss();
          }}
        />
      ))}
      <SheetItem
        icon={<X {...sheetIcon} size={ICON_SIZES.lg} color={COLORS.danger} />}
        label="Remove Set"
        destructive
        onPress={() => {
          onRemove();
          onDismiss();
        }}
      />
    </BottomSheet>
  );
}
