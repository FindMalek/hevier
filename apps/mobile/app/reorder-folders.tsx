import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';

import { HeaderTextButton, InnerHeader } from '@/components/ui/InnerHeader';
import { ReorderList } from '@/components/ui/ReorderList';
import { getRoutineOverview, reorderFolders } from '@/db/routines/folders';
import type { ReorderItem } from '@/types/ui';
import { Screen } from '@/components/ui/Screen';

// Reorder Folders, laid out like Workout Settings: grey header
// with ←, centred title and a blue Done, then plain rows with inset dividers.
// Drag a folder by its ≡ handle. Nothing is saved until Done; ← discards.
export default function ReorderFolders() {
  const router = useRouter();
  const [folders, setFolders] = useState<ReorderItem[]>([]);

  useEffect(() => {
    getRoutineOverview().then((o) => setFolders(o.folders.map(({ id, name }) => ({ id, label: name }))));
  }, []);

  async function done() {
    await reorderFolders(folders.map((f) => f.id));
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Reorder Folders" right={<HeaderTextButton label="Done" onPress={done} />} />
      <ReorderList items={folders} onChange={setFolders} />
    </Screen>
  );
}
