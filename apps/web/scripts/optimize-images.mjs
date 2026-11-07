// Converts the product screenshots in docs/images/screens to WebP for the site.
// Run from apps/web: node scripts/optimize-images.mjs
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(root, '../../docs/images/screens');
const target = path.join(root, 'public/screens');

await mkdir(target, { recursive: true });

for (const file of await readdir(source)) {
  if (!file.endsWith('.png')) continue;
  const out = path.join(target, file.replace('.png', '.webp'));
  const info = await sharp(path.join(source, file)).webp({ quality: 84, effort: 6, alphaQuality: 100 }).toFile(out);
  console.log(`${file} -> ${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}

await sharp(path.resolve(root, '../mobile/assets/images/icon.png'))
  .resize(512, 512)
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'src/app/icon.png'));
await sharp(path.resolve(root, '../mobile/assets/images/icon.png'))
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'src/app/apple-icon.png'));
await sharp(path.resolve(root, '../mobile/assets/images/icon.png'))
  .resize(160, 160)
  .webp({ quality: 90 })
  .toFile(path.join(target, 'app-icon.webp'));
console.log('icons written');
