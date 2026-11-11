// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fontsourceRanges from '@fontsource-variable/sofia-sans/unicode.json' with { type: 'json' };

const NOT_FOUND_PATH = '/404';
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://sezon.example';

/** Fontsource unicode ranges per subset (identical for both families). */
const RANGES = /** @type {Record<'latin' | 'cyrillic', string>} */ (fontsourceRanges);

/**
 * Splits a Fontsource unicode-range string into a non-empty list of ranges.
 * @param {string} ranges - Comma-separated ranges, e.g. `U+0400-045F,U+2116`.
 */
const rangeList = (ranges) => /** @type {[string, ...string[]]} */ (ranges.split(','));

/**
 * Returns the Latin and Cyrillic local font variants for a Fontsource variable font file pattern.
 * Latin comes first: Astro measures the fallback metrics from the first file, and those metrics
 * need Latin letters.
 * @param {string} pkg - Package name, e.g. `@fontsource-variable/piazzolla`.
 * @param {string} file - File name with a `{subset}` placeholder.
 * @param {{ weight: string; style: 'normal' | 'italic' }} face - Weight range and style.
 */
const subsets = (pkg, file, face) => {
  /** @param {string} subset @param {[string, ...string[]]} unicodeRange */
  const variant = (subset, unicodeRange) => ({
    ...face,
    display: /** @type {const} */ ('swap'),
    unicodeRange,
    src: /** @type {[string]} */ ([`${pkg}/files/${file.replace('{subset}', subset)}`]),
  });
  return {
    latin: variant('latin', rangeList(RANGES.latin)),
    cyrillic: variant('cyrillic', rangeList(RANGES.cyrillic)),
  };
};

const PIAZZOLLA = subsets(
  '@fontsource-variable/piazzolla',
  'piazzolla-{subset}-wght-normal.woff2',
  {
    weight: '100 900',
    style: 'normal',
  },
);
const PIAZZOLLA_ITALIC = subsets(
  '@fontsource-variable/piazzolla',
  'piazzolla-{subset}-wght-italic.woff2',
  { weight: '100 900', style: 'italic' },
);
const SOFIA_SANS = subsets(
  '@fontsource-variable/sofia-sans',
  'sofia-sans-{subset}-wght-normal.woff2',
  {
    weight: '1 1000',
    style: 'normal',
  },
);

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Piazzolla',
      cssVariable: '--font-piazzolla',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          PIAZZOLLA.latin,
          PIAZZOLLA.cyrillic,
          PIAZZOLLA_ITALIC.latin,
          PIAZZOLLA_ITALIC.cyrillic,
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Sofia Sans',
      cssVariable: '--font-sofia-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [SOFIA_SANS.latin, SOFIA_SANS.cyrillic],
      },
    },
  ],
  integrations: [sitemap({ filter: (page) => !page.endsWith(NOT_FOUND_PATH) })],
});
