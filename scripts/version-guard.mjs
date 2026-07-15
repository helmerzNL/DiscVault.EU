import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const version = (await readFile('VERSION', 'utf8')).trim();
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const protectedPrefixes = JSON.parse(
  await readFile('scripts/protected-paths.json', 'utf8'),
);

if (!/^\d+\.\d+\.\d+(?:-beta\.\d+)?$/.test(version)) {
  throw new Error(`VERSION is not an allowed semantic version: ${version}`);
}
if (packageJson.version !== version) {
  throw new Error(
    `VERSION (${version}) and package.json (${packageJson.version}) differ`,
  );
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
}

let changed = [];
if (process.argv.includes('--staged')) {
  changed = git(['diff', '--cached', '--name-only', '--diff-filter=ACMRD']);
} else if (process.env.VERSION_GUARD_BASE) {
  changed = git([
    'diff',
    '--name-only',
    '--diff-filter=ACMRD',
    `${process.env.VERSION_GUARD_BASE}...HEAD`,
  ]);
}

const protectedChange = changed.some((file) =>
  protectedPrefixes.some(
    (prefix) => file === prefix || file.startsWith(prefix),
  ),
);

if (protectedChange && !changed.includes('VERSION')) {
  console.error(
    'Protected site files changed without VERSION. Run: corepack pnpm version:set <version>',
  );
  process.exit(1);
}

console.log(
  changed.length
    ? `Version guard passed for ${changed.length} changed file(s)`
    : `Version files are synchronized at ${version}`,
);
