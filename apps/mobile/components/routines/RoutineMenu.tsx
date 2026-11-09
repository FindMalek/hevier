import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Copy } from 'phosphor-react-native/src/icons/Copy';
import { PencilSimple } from 'phosphor-react-native/src/icons/PencilSimple';
import { X } from 'phosphor-react-native/src/icons/X';

import { BottomSheet, SheetItem, sheetIcon } from '@/components/ui/BottomSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { COLORS } from '@/constants/theme';
import { deleteRoutine, duplicateRoutine } from '@/db/routines/write';
import { ICON_SIZES } from '@/constants/sizes';
import { useAfterSheetClose } from '@/hooks/useAfterSheetClose';
import type { RoutineMenuProps } from './types';

// A routine's ⋯ menu, used on the Workout tab and the routine page.
// The sheet slides away before the delete confirmation opens.
export function RoutineMenu({
  routine,
  onClose,
  onDuplicated,
  onDeleted,
}: RoutineMenuProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  // What the sheet opens once it has slid away.
  const afterSheet = useAfterSheetClose();

  function then(action: (r: { id: string; name: string }) => void) {
    if (!routine) return;
    const r = routine;
    afterSheet.later(() => action(r));
    onClose();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteRoutine(deleting.id);
    setDeleting(null);
    onDeleted();
  }

  return (
    <>
      <BottomSheet
        visible={routine !== null}
        title={routine?.name ?? ''}
        onDismiss={onClose}
        onClosed={afterSheet.onClosed}>
        <SheetItem
          first
          icon={<Copy {...sheetIcon} size={ICON_SIZES.xxl} />}
          label="Duplicate Routine"
          onPress={() => then((r) => duplicateRoutine(r.id).then(onDuplicated))}
        />
        <SheetItem
          icon={<PencilSimple {...sheetIcon} size={ICON_SIZES.xxl} />}
          label="Edit Routine"
          onPress={() => then((r) => router.push({ pathname: '/routine-editor', params: { id: r.id } }))}
        />
        <SheetItem
          icon={<X {...sheetIcon} size={ICON_SIZES.lg} color={COLORS.danger} />}
          label="Delete Routine"
          destructive
          onPress={() => then(setDeleting)}
        />
      </BottomSheet>

      <ConfirmDialog
        visible={deleting !== null}
        message="Are you sure you want to delete this routine?"
        confirmLabel="Delete Routine"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
