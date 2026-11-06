// Writes the Recovery widget's body shapes (modules/home-widgets/.../res/raw/body_paths.json)
// from MuscleMap's path data (@musclemap/assets, MIT, https://github.com/Jsplice/MuscleMap),
// the same shapes components/body/MuscleMapBody.tsx draws in the app.
// Run again after updating @musclemap/assets: node scripts/widgets/body-paths.mjs
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { MALE_FRONT, MALE_BACK } = createRequire(import.meta.url)('@musclemap/assets');
const side = (d) => ({
  centerX: d.centerX,
  outline: d.outline.map((o) => ({ side: o.side, d: o.d })),
  muscles: d.muscles.map((m) => ({ group: m.group, side: m.side, d: m.d })),
});
const out = new URL('../../modules/home-widgets/android/src/main/res/raw/body_paths.json', import.meta.url);
writeFileSync(
  out,
  JSON.stringify({ source: 'MuscleMap (@musclemap/assets), MIT', front: side(MALE_FRONT), back: side(MALE_BACK) })
);
console.log('wrote', out.pathname);
