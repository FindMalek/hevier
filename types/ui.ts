import type { ReactNode } from 'react';

// One row of a drag-to-reorder list (components/ui/ReorderList.tsx).
export interface ReorderItem {
  id: string;
  label: string;
  left?: ReactNode; // e.g. the exercise picture
}

// What a tab bar icon is drawn with (components/ui/TabIcons.tsx).
export interface TabIconProps {
  color: string;
  active: boolean;
}

// The web build's HTML page (app/+html.tsx).
export interface HtmlRootProps {
  children: ReactNode;
}
