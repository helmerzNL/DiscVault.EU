import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

const host = '127.0.0.1';
const port = 4173;
const urls = [
  `http://${host}:${port}/`,
  `http://${host}:${port}/nl/`,
  `http://${host}:${port}/privacy.html`,
];
const budgets = {
  performance: 0.8,
  accessibility: 0.95,
  'best-practices': 0.9,
  seo: 0.95,
};

const server = spawn(
  process.execPath,
  ['scripts/serve-dist.mjs', '--host', host, '--port', String(port)],
  { stdio: ['ignore', 'pipe', 'inherit'] },
);

await new Promise((resolve, reject) => {
  const timeout = setTimeout(
    () => reject(new Error('Static preview did not start')),
    10_000,
  );
  server.once('exit', (code) =>
    reject(new Error(`Static preview exited with code ${code}`)),
  );
  server.stdout.on('data', (chunk) => {
    if (chunk.toString().includes('DiscVault dist preview:')) {
      clearTimeout(timeout);
      resolve();
    }
  });
});

let chrome;
let failed = false;
try {
  chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });
  await mkdir('.lighthouseci/reports', { recursive: true });

  for (const url of urls) {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: Object.keys(budgets),
    });
    if (!result) throw new Error(`Lighthouse returned no result for ${url}`);

    const scores = Object.fromEntries(
      Object.entries(budgets).map(([category, minimum]) => {
        const score = result.lhr.categories[category]?.score ?? 0;
        if (score < minimum) failed = true;
        return [category, score];
      }),
    );
    const slug =
      new URL(url).pathname.replaceAll(/[^a-z0-9]+/gi, '-') || 'home';
    await writeFile(
      `.lighthouseci/reports/${slug}.json`,
      result.report,
      'utf8',
    );
    console.log(
      `${url} ${Object.entries(scores)
        .map(([name, score]) => `${name}=${Math.round(score * 100)}`)
        .join(' ')}`,
    );
  }
} finally {
  try {
    if (chrome) await chrome.kill();
  } catch {
    console.warn(
      'Chromium exited but its temporary profile cleanup was delayed',
    );
  } finally {
    server.kill();
  }
}

if (failed) {
  console.error('One or more Lighthouse category budgets failed');
  process.exit(1);
}

console.log('Lighthouse category budgets passed');
