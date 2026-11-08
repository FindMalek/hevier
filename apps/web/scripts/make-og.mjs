// Renders public/og.png (1200x630) with the site's own font and the real recovery screenshot.
// Run from apps/web: node scripts/make-og.mjs   (set PW_CHROMIUM_PATH to reuse a local Chromium)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const font = (await readFile(path.join(root, 'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2'))).toString('base64');
const shot = (await readFile(path.join(root, 'public/screens/recovery.webp'))).toString('base64');
const icon = (await readFile(path.join(root, 'public/screens/app-icon.webp'))).toString('base64');

const html = `<!doctype html><html><head><style>
@font-face { font-family: Geist; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: Geist, sans-serif; color: #1d1d1f; background:
  radial-gradient(40% 55% at 10% 10%, rgba(10,132,255,.22), transparent 70%),
  radial-gradient(35% 50% at 95% 5%, rgba(175,130,255,.22), transparent 70%),
  radial-gradient(40% 50% at 60% 105%, rgba(52,199,89,.2), transparent 70%), #fbfbfd; position: relative; }
.brand { position: absolute; left: 72px; top: 64px; display: flex; align-items: center; gap: 16px; font-size: 36px; font-weight: 700; letter-spacing: -0.03em; }
.brand img { width: 60px; height: 60px; border-radius: 15px; }
h1 { position: absolute; left: 72px; top: 200px; font-size: 92px; line-height: .98; font-weight: 640; letter-spacing: -0.055em; }
h1 span { background: linear-gradient(100deg, #1d1d1f 10%, #3a5bff 55%, #1d9bf0); -webkit-background-clip: text; color: transparent; }
.tags { position: absolute; left: 72px; bottom: 60px; display: flex; gap: 12px; font-size: 23px; color: #4b4b50; font-weight: 520; }
.tags b { color: #c0c0c8; font-weight: 400; }
.phone { position: absolute; right: 64px; top: 90px; width: 330px; transform: rotate(5deg); padding: 3px; border-radius: 30px;
  background: linear-gradient(135deg,#fefefe,#cfd2d9 20%,#8e929b 46%,#d5d7dd 70%,#f6f6f8); box-shadow: 0 50px 70px -20px rgba(24,36,72,.35), 0 12px 20px -6px rgba(24,36,72,.2); }
.phone img { display: block; width: 100%; border-radius: 27px; }
</style></head><body>
<div class="brand"><img src="data:image/webp;base64,${icon}">Hevier</div>
<h1>Train hard.<br><span>Recover smart.</span></h1>
<div class="tags"><span>Free and open source</span><b>/</b><span>No account, no ads</span><b>/</b><span>Android today</span></div>
<div class="phone"><img src="data:image/webp;base64,${shot}"></div>
</body></html>`;

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'public/og.png') });
await browser.close();
console.log('wrote public/og.png');
