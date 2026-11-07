import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'Hevier: train hard, recover smart. A free, open-source workout tracker.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BLOBS =
  'radial-gradient(40% 50% at 12% 20%, rgba(10,132,255,0.28), rgba(10,132,255,0) 70%), radial-gradient(36% 46% at 88% 12%, rgba(175,130,255,0.28), rgba(175,130,255,0) 70%), radial-gradient(40% 50% at 70% 100%, rgba(52,199,89,0.22), rgba(52,199,89,0) 70%)';

export default async function OpengraphImage() {
  const icon = await readFile(path.join(process.cwd(), 'src/app/icon.png'));
  const iconSrc = `data:image/png;base64,${icon.toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#fbfbfd',
          backgroundImage: BLOBS,
          color: '#1d1d1f',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 38, fontWeight: 700 }}>
          <img src={iconSrc} alt="" width={64} height={64} style={{ borderRadius: 16 }} />
          Hevier
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 132, lineHeight: 1, fontWeight: 700, letterSpacing: -4 }}>Train hard.</div>
          <div style={{ fontSize: 132, lineHeight: 1.05, fontWeight: 700, letterSpacing: -4, color: '#2563eb' }}>
            Recover smart.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 30, color: '#4b4b50' }}>
          <span>Free and open source</span>
          <span style={{ color: '#b0b0b8' }}>/</span>
          <span>No account, no ads</span>
          <span style={{ color: '#b0b0b8' }}>/</span>
          <span>Android today</span>
        </div>
      </div>
    ),
    size,
  );
}
