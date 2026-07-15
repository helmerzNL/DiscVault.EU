import type { MarketingContent } from './types';

export const localeCodes = [
  'en',
  'cs',
  'da',
  'de',
  'el',
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
] as const;

export type Locale = (typeof localeCodes)[number];

const localeModules = import.meta.glob<MarketingContent>('./locales/*.json', {
  eager: true,
  import: 'default',
});

export const contentByLocale = Object.fromEntries(
  Object.entries(localeModules).map(([path, content]) => [
    path.match(/\/([^/]+)\.json$/)?.[1],
    content,
  ]),
) as Record<Locale, MarketingContent>;

export function localePath(locale: Locale): string {
  return locale === 'en' ? '/' : `/${locale}/`;
}
