import { ArrowsDownUp } from 'phosphor-react-native/src/icons/ArrowsDownUp';
import { PencilSimple } from 'phosphor-react-native/src/icons/PencilSimple';
import { Plus } from 'phosphor-react-native/src/icons/Plus';
import { TrashSimple } from 'phosphor-react-native/src/icons/TrashSimple';

import { BottomSheet, SheetItem, sheetIcon } from '@/components/ui/BottomSheet';
import { COLORS } from '@/constants/theme';
import { ICON_SIZES } from '@/constants/sizes';
import type { FolderMenuSheetProps } from './types';

// A folder's ⋯ sheet. Share Folder is left out, like Share Routine.
// Each option gets the folder; the screen runs it once the sheet has slid away.
export function FolderMenuSheet({ folder, onDismiss, onClosed, onReorder, onRename, onAddRoutine, onDelete }: FolderMenuSheetProps) {
  const pick = (action: (f: NonNullable<typeof folder>) => void) => () => folder && action(folder);
  return (
    <BottomSheet visible={folder !== null} title={folder?.name ?? ''} onDismiss={onDismiss} onClosed={onClosed}>
      <SheetItem first icon={<ArrowsDownUp {...sheetIcon} size={ICON_SIZES.huge} />} label="Reorder Folders" onPress={onReorder} />
      <SheetItem icon={<PencilSimple {...sheetIcon} size={ICON_SIZES.xxl} />} label="Rename Folder" onPress={pick(onRename)} />
      <SheetItem icon={<Plus {...sheetIcon} size={ICON_SIZES.xl} />} label="Add New Routine" onPress={pick(onAddRoutine)} />
      <SheetItem
        icon={<TrashSimple {...sheetIcon} size={ICON_SIZES.xxl} color={COLORS.danger} />}
        label="Delete Folder"
        destructive
        onPress={pick(onDelete)}
      />
    </BottomSheet>
  );
}
