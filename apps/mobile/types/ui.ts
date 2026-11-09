import type { ReactNode } from 'react';

// One row of a drag-to-reorder list (components/ui/ReorderList.tsx).
export interface ReorderItem {
  id: string;
  label: string;
  left?: ReactNode; // e.g. the exercise picture
}

// The web build's HTML page (app/+html.tsx).
export interface HtmlRootProps {
  children: ReactNode;
}
