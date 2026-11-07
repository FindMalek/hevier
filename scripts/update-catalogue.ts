import fs from 'node:fs';
import path from 'node:path';
import { catalogueUpdate, fromOpenGym } from './import/catalogueUpdate';
import type { CatalogueEntry, OpenGymEntry } from '@/types/import';

// Brings catalogue/exercises.json up to date with an openGym checkout and
// writes the migration that does the same to installed databases:
//
//   npx tsx scripts/update-catalogue.ts <openGym>/catalogue/exercises <version> <name>
//
// Then add the migration to db/migrations/index.ts.

const ROOT = path.join(__dirname, '..');
const CATALOGUE_PATH = path.join(ROOT, 'catalogue', 'exercises.json');

function main() {
  const [dir, version, name] = process.argv.slice(2);
  if (!dir || !version || !name) {
    console.error('Usage: npx tsx scripts/update-catalogue.ts <openGym exercises dir> <version> <name>');
    process.exit(1);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as OpenGymEntry);
  const before = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf-8')) as CatalogueEntry[];
  const after = fromOpenGym(files);
  const { removedIds, sql } = catalogueUpdate(before, after);

  fs.writeFileSync(CATALOGUE_PATH, JSON.stringify(after));
  const file = path.join(ROOT, 'db', 'migrations', `${version.padStart(3, '0')}_${name}.ts`);
  const lines = sql.map((s) => `  ${JSON.stringify(s)},`).join('\n');
  fs.writeFileSync(
    file,
    `// Made by scripts/update-catalogue.ts: openGym's newer catalogue data for\n` +
      `// exercises already installed (with constants/muscleRules.ts on top), and its\n// female copies of an exercise removed.\n` +
      `export const sql = [\n${lines}\n].join('\\n');\n`
  );
  console.log(`${after.length} exercises, ${sql.length - (removedIds.length ? 1 : 0)} updated, ${removedIds.length} removed`);
  console.log(`Wrote ${path.relative(ROOT, file)}`);
}

main();
