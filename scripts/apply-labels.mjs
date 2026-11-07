#!/usr/bin/env node
// Creates or updates the repo's labels from .github/labels.json.
//
//   node scripts/apply-labels.mjs            print the gh commands, change nothing
//   node scripts/apply-labels.mjs --apply    run them (needs `gh auth login` and write access)
//   node scripts/apply-labels.mjs --apply --repo owner/name
//
// `gh label create --force` updates the colour and description of a label that
// already exists, so running it twice is safe. It never deletes a label.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const repoIndex = args.indexOf('--repo');
const repo = repoIndex === -1 ? null : args[repoIndex + 1];
if (repoIndex !== -1 && !repo) {
  console.error('--repo needs a value, like owner/name');
  process.exit(1);
}

const file = fileURLToPath(new URL('../.github/labels.json', import.meta.url));
const labels = JSON.parse(readFileSync(file, 'utf8'));

const names = new Set();
for (const { name, color, description } of labels) {
  if (!name || !/^[0-9a-f]{6}$/i.test(color) || !description) {
    console.error(`Bad label entry: ${JSON.stringify({ name, color, description })}`);
    process.exit(1);
  }
  if (names.has(name)) {
    console.error(`Duplicate label: ${name}`);
    process.exit(1);
  }
  names.add(name);
}

for (const { name, color, description } of labels) {
  const ghArgs = ['label', 'create', name, '--color', color, '--description', description, '--force'];
  if (repo) ghArgs.push('--repo', repo);
  if (!apply) {
    const quoted = ghArgs.map((a) => (/^[\w:./-]+$/.test(a) ? a : JSON.stringify(a)));
    console.log(['gh', ...quoted].join(' '));
    continue;
  }
  execFileSync('gh', ghArgs, { stdio: 'inherit' });
}

if (!apply) console.error(`\n${labels.length} labels. Dry run: add --apply to create them.`);
