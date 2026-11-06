import type { ReactNode } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';
import type { Gesture } from 'react-native-gesture-handler';
import type Animated from 'react-native-reanimated';
import type { SharedValue, useAnimatedRef } from 'react-native-reanimated';
import type { Cycle, DragListItem, RoutineSummary } from '@/types/routine';

// Props of the routines components (components/routines/).

export interface CycleCardProps {
  cycle: Cycle;
  now: number;
  onOpen: (routineId: string) => void;
  onStart: (routineId: string) => void;
  onSkip: () => void;
}

export interface DragItemProps {
  drag: RoutineDrag;
  index: number;
  draggable?: boolean;
  children: ReactNode;
}

export interface MoreButtonProps {
  onPress?: () => void;
}

export interface FolderHeaderProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  onMore?: () => void;
}

export interface RoutineCardProps {
  routine: RoutineSummary;
  onPress: () => void;
  onStart: () => void;
  onMore: () => void;
}

export interface AddRoutineBoxProps {
  onPress: () => void;
}

export interface RoutineMenuProps {
  routine: { id: string; name: string } | null;
  onClose: () => void;
  onDuplicated: () => void;
  onDeleted: () => void;
}

export interface Box {
  y: number; // in the list's content
  h: number; // with the card's bottom margin
}

export interface RoutineDrag {
  dragging: SharedValue<number>; // index of the lifted card, -1 = none
  target: SharedValue<number>; // insertion point among the other items
  ghostReady: SharedValue<boolean>; // the copy under the finger is drawn
  boxes: SharedValue<Box[]>;
  onItemLayout: (index: number, e: LayoutChangeEvent) => void;
  pan: (index: number) => ReturnType<typeof Gesture.Pan>;
  // The list's onLayout and onContentSizeChange.
  onListLayout: (e: LayoutChangeEvent) => void;
  onContentSize: (width: number, height: number) => void;
}

// What useRoutineDrag needs: the flat list, what a drop does, and how to draw
// the copy under the finger.
export interface RoutineDragOptions {
  items: DragListItem[];
  onDrop: (routineId: string, folderId: string | null, index: number) => void;
  renderGhost: (routineId: string) => ReactNode;
}

export interface RoutineDragResult {
  drag: RoutineDrag; // stable while the number of items stays the same
  overlay: ReactNode;
  scrollRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
  listRef: ReturnType<typeof useAnimatedRef<View>>;
}
