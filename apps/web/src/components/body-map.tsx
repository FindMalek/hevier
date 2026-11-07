import type { BodyDiagram } from '@musclemap/assets';
import { compactPath } from '@/lib/compact-path';

// Path data from @musclemap/assets (MIT, https://github.com/Jsplice/MuscleMap), the same
// body the app draws, rewritten as whole-unit relative paths to keep the page light.
const VIEWBOX = '195 60 634 1390';

export function BodyMap({ diagram }: { diagram: BodyDiagram }) {
  return (
    <svg viewBox={VIEWBOX} className="body-svg" aria-hidden focusable="false">
      {diagram.outline.map((part) => (
        <path key={part.id} className="body-outline" d={compactPath(part.d)} />
      ))}
      {diagram.muscles.map((muscle, index) => (
        <path
          key={`${muscle.group}-${muscle.id ?? index}`}
          className="m"
          data-g={muscle.group}
          style={{ fill: `var(--f-${muscle.group}, url(#g-idle))` }}
          d={compactPath(muscle.d)}
        />
      ))}
    </svg>
  );
}
