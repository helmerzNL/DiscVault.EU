import { readdir, readFile } from 'node:fs/promises';

const expectedLocales = [
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'hu',
  'it',
  'ja',
  'ko',
  'nl',
  'no',
  'pl',
  'pt',
  'sv',
  'tr',
  'uk',
  'zh',
];

const files = (await readdir('src/content/locales'))
  .filter((file) => file.endsWith('.json'))
  .sort();
const actualLocales = files.map((file) => file.replace(/\.json$/, ''));

if (JSON.stringify(actualLocales) !== JSON.stringify(expectedLocales)) {
  throw new Error(
    `Locale set differs.\nExpected: ${expectedLocales.join(', ')}\nActual: ${actualLocales.join(', ')}`,
  );
}

function shape(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => shape(item, `${prefix}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .flatMap((key) => shape(value[key], prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

function findEmpty(value, prefix = '') {
  if (typeof value === 'string') {
    return value.trim() ? [] : [prefix];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findEmpty(item, `${prefix}[${index}]`),
    );
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      findEmpty(item, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

const locales = Object.fromEntries(
  await Promise.all(
    files.map(async (file) => [
      file.replace(/\.json$/, ''),
      JSON.parse(await readFile(`src/content/locales/${file}`, 'utf8')),
    ]),
  ),
);

const referenceShape = shape(locales.en);
const localizedCopyPaths = [
  'trust.noTrackingTitle',
  'trust.noTrackingBody',
  'trust.controlTitle',
  'trust.controlBody',
  'comparison.eyebrow',
  'comparison.bestFor',
  'comparison.iosSetup',
  'comparison.selfSetup',
  'footer.legacy',
  'footer.terms',
];

function valueAtPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current[key], value);
}

for (const [locale, content] of Object.entries(locales)) {
  const localeShape = shape(content);
  const missing = referenceShape.filter((key) => !localeShape.includes(key));
  const extra = localeShape.filter((key) => !referenceShape.includes(key));
  const empty = findEmpty(content);

  if (content.locale !== locale) {
    throw new Error(`${locale}.json declares locale "${content.locale}"`);
  }
  if (content.capabilities.items.length !== 6) {
    throw new Error(`${locale}.json must contain exactly six capabilities`);
  }
  if (locale !== 'en') {
    const untranslated = localizedCopyPaths.filter(
      (key) => valueAtPath(content, key) === valueAtPath(locales.en, key),
    );
    if (untranslated.length) {
      throw new Error(
        `${locale}.json retains English localized copy: ${untranslated.join(', ')}`,
      );
    }
  }
  if (missing.length || extra.length || empty.length) {
    throw new Error(
      `${locale} parity failed\nMissing: ${missing.join(', ')}\nExtra: ${extra.join(', ')}\nEmpty: ${empty.join(', ')}`,
    );
  }
}

console.log(
  `Locale parity passed: ${files.length} locales, ${referenceShape.length} leaf values each`,
);
