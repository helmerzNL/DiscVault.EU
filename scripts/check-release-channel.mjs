import { readFile } from 'node:fs/promises';

const tag = process.env.GITHUB_REF_NAME ?? process.argv[2] ?? '';
const version = (await readFile('VERSION', 'utf8')).trim();
const stable = /^v\d+\.\d+\.\d+$/.test(tag);
const beta = /^v\d+\.\d+\.\d+-beta\.\d+$/.test(tag);

if (!stable && !beta) {
  throw new Error(`Invalid release tag "${tag}". Use vX.Y.Z or vX.Y.Z-beta.N.`);
}
if (tag !== `v${version}`) {
  throw new Error(`Tag ${tag} does not match VERSION v${version}`);
}

console.log(`${tag} is a valid ${beta ? 'beta' : 'stable'} release`);
