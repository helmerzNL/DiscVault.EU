import { readFile, writeFile } from 'node:fs/promises';

const next = process.argv[2]?.replace(/^v/, '');
if (!next || !/^\d+\.\d+\.\d+(?:-beta\.\d+)?$/.test(next)) {
  console.error('Usage: pnpm version:set <X.Y.Z|X.Y.Z-beta.N>');
  process.exit(1);
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const current = (await readFile('VERSION', 'utf8')).trim();
const packageChanged = packageJson.version !== next;
const versionChanged = current !== next;

if (packageChanged) {
  packageJson.version = next;
  await writeFile('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
}
if (versionChanged) {
  await writeFile('VERSION', `${next}\n`);
}

console.log(
  packageChanged || versionChanged
    ? `Version set to ${next}`
    : `Version already ${next}; no changes made`,
);
