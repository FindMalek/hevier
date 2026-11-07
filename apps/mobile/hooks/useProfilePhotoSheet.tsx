import { useCallback, useState } from 'react';
import { ImageSquare } from 'phosphor-react-native/src/icons/ImageSquare';
import { TrashSimple } from 'phosphor-react-native/src/icons/TrashSimple';

import { BottomSheet, SheetItem, sheetIcon } from '@/components/ui/BottomSheet';
import { pickProfilePhoto, removeProfilePhoto, useProfilePhoto } from '@/stores/profilePhoto';
import { COLORS } from '@/constants/theme';
import { useAfterSheetClose } from '@/hooks/useAfterSheetClose';

// The Profile avatar's tap: with a photo, a Choose New / Remove sheet; without,
// the picker straight away. Returns the tap handler and the sheet to render.
export function useProfilePhotoSheet() {
  const hasPhoto = useProfilePhoto() !== null;
  const [open, setOpen] = useState(false);
  // Runs once the sheet has slid away (the picker opens over it otherwise).
  const afterSheet = useAfterSheetClose();
  const choosePhoto = useCallback(() => {
    pickProfilePhoto().catch((e) => console.warn('[photo] pick failed', e));
  }, []);
  const onAvatar = useCallback(() => (hasPhoto ? setOpen(true) : choosePhoto()), [hasPhoto, choosePhoto]);
  function fromSheet(action: () => void) {
    afterSheet.later(action);
    setOpen(false);
  }

  const sheet = (
    <BottomSheet visible={open} title="Profile Photo" onDismiss={() => setOpen(false)} onClosed={afterSheet.onClosed}>
      <SheetItem first icon={<ImageSquare {...sheetIcon} />} label="Choose New Photo" onPress={() => fromSheet(choosePhoto)} />
      <SheetItem
        icon={<TrashSimple {...sheetIcon} color={COLORS.danger} />}
        label="Remove Photo"
        destructive
        onPress={() => fromSheet(() => removeProfilePhoto().catch((e) => console.warn('[photo] remove failed', e)))}
      />
    </BottomSheet>
  );

  return { onAvatar, sheet };
}
