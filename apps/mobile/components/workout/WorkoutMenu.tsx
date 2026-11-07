import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Copy } from 'phosphor-react-native/src/icons/Copy';
import { DownloadSimple } from 'phosphor-react-native/src/icons/DownloadSimple';
import { PencilSimple } from 'phosphor-react-native/src/icons/PencilSimple';
import { X } from 'phosphor-react-native/src/icons/X';

import { BottomSheet, SheetItem, sheetIcon } from '@/components/ui/BottomSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { COLORS } from '@/constants/theme';
import { deleteWorkout } from '@/db/workouts/delete';
import { deleteMediaFiles } from '@/lib/workoutMedia';
import { ICON_SIZES } from '@/constants/sizes';
import { useAfterSheetClose } from '@/hooks/useAfterSheetClose';

// A saved workout's ⋯ menu, shared by the Home feed, the Profile and the
// workout page.
export function useWorkoutMenu(onDeleted: () => void) {
  const router = useRouter();
  const { start, dialog: startDialog } = useStartWorkout();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  // What the sheet opens once it has slid away.
  const afterMenu = useAfterSheetClose();

  function then(action: (id: string) => void) {
    const id = menuFor;
    if (id) afterMenu.later(() => action(id));
    setMenuFor(null);
  }

  // A double tap on Delete Workout would run the delete twice.
  const deletingNow = useRef(false);
  async function confirmDelete() {
    if (!deleting || deletingNow.current) return;
    deletingNow.current = true;
    try {
      deleteMediaFiles(await deleteWorkout(deleting));
      setDeleting(null);
      onDeleted();
    } catch (e) {
      console.warn('Delete workout failed', e);
      setDeleting(null);
    } finally {
      deletingNow.current = false;
    }
  }

  const menu = (
    <>
      <BottomSheet
        visible={menuFor !== null}
        onDismiss={() => setMenuFor(null)}
        onClosed={afterMenu.onClosed}>
        {/* Nothing is created until the editor's Save. */}
        <SheetItem
          first
          icon={<DownloadSimple {...sheetIcon} />}
          label="Save as Routine"
          onPress={() => then((id) => router.push({ pathname: '/routine-editor', params: { fromWorkout: id } }))}
        />
        {/* A new workout with this one's sets, none done; one in progress asks first. */}
        <SheetItem icon={<Copy {...sheetIcon} />} label="Copy Workout" onPress={() => then((id) => start({ copyOf: id }))} />
        <SheetItem
          icon={<PencilSimple {...sheetIcon} />}
          label="Edit Workout"
          onPress={() => then((id) => router.push({ pathname: '/routine-editor', params: { workout: id } }))}
        />
        <SheetItem
          icon={<X {...sheetIcon} size={ICON_SIZES.lg} color={COLORS.danger} />}
          label="Delete Workout"
          destructive
          onPress={() => then(setDeleting)}
        />
      </BottomSheet>

      <ConfirmDialog
        visible={deleting !== null}
        message="Are you sure you want to delete this workout?"
        confirmLabel="Delete Workout"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      {startDialog}
    </>
  );

  return { openMenu: setMenuFor, menu };
}
