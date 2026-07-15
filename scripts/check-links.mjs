import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(target) : target;
      }),
    )
  ).flat();
}

function outputTarget(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (clean.endsWith('/')) return path.join(root, clean, 'index.html');
  return path.join(root, clean);
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const errors = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const values = [
    ...[...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map(
      (match) => match[1],
    ),
    ...[...html.matchAll(/\bsrcset=["']([^"']+)["']/gi)].flatMap((match) =>
      match[1].split(',').map((part) => part.trim().split(/\s+/)[0]),
    ),
  ];

  for (const value of values) {
    if (
      !value ||
      value.startsWith('#') ||
      /^(?:https?:|mailto:|tel:|data:)/i.test(value)
    ) {
      continue;
    }
    const resolved = value.startsWith('/')
      ? new URL(value, 'https://discvault.eu').pathname
      : path
          .relative(root, path.resolve(path.dirname(file), value.split('#')[0]))
          .replaceAll('\\', '/');
    const target = outputTarget(
      value.startsWith('/') ? resolved : `/${resolved}`,
    );
    checked += 1;
    try {
      await access(target);
    } catch {
      errors.push(
        `${path.relative(root, file)} -> ${value} (missing ${path.relative(root, target)})`,
      );
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `Internal link check passed: ${checked} asset/page references across ${htmlFiles.length} HTML files`,
);
