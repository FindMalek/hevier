import type { MuscleGroup } from '@/types/muscles';
import type { BodyDiagram } from '@musclemap/assets';

// Props of the body components (components/body/).

export interface BodyFigureProps {
  shades: Map<MuscleGroup, string>;
  legend: LegendItem[];
  height?: number;
}

export interface LegendProps {
  items: LegendItem[];
}

export interface SideProps {
  diagram: BodyDiagram;
  colorOf: Map<string, string>;
  height: number;
}

export interface MuscleMapBodyProps {
  colorOf: Map<string, string>;
  height: number;
  vertical?: boolean;
}

export interface LegendItem {
  color: string;
  label: string;
  range?: string; // grey, on the right
}
