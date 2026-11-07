import Image from 'next/image';
import type { CSSProperties } from 'react';

interface PhoneProps {
  src: string;
  alt: string;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}

const SCREEN_WIDTH = 560;

export function Phone({ src, alt, height = 1190, priority = false, sizes = '340px', className, style }: PhoneProps) {
  return (
    <div className={`phone ${className ?? ''}`} style={{ '--ar': `${SCREEN_WIDTH} / ${height}`, ...style } as CSSProperties}>
      <div className="phone-ring">
        <Image src={src} alt={alt} width={SCREEN_WIDTH} height={height} sizes={sizes} priority={priority} />
      </div>
      <span className="phone-gloss" aria-hidden />
    </div>
  );
}
