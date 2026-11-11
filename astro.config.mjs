// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import {
  FONT_FACES,
  FONT_OUTPUT_DIR,
  FONT_SUBSETS,
  subsetFile,
} from './src/design/fontSubsets.mjs';

/** Pages left out of the sitemap: the error page and the search page (both `noindex`). */
const UNLISTED_PATHS = ['/404', '/tarsene'];
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://sezon.example';

/**
 * Splits a unicode-range string into a non-empty list of ranges.
 * @param {string} ranges - Comma-separated ranges, e.g. `U+0400-045F,U+2116`.
 */
const rangeList = (ranges) => /** @type {[string, ...string[]]} */ (ranges.split(','));

/**
 * Returns the Latin and Cyrillic local font variants of a generated face (`pnpm fonts:build`).
 * Latin comes first: Astro measures the fallback metrics from the first file, and those metrics
 * need Latin letters.
 * @param {(typeof FONT_FACES)[number]} face - Face from `src/design/fontSubsets.mjs`.
 */
const variants = (face) => {
  /** @param {keyof typeof FONT_SUBSETS} subset */
  const variant = (subset) => ({
    weight: `${face.weight.min} ${face.weight.max}`,
    style: face.style,
    display: /** @type {'optional' | 'swap'} */ (face.style === 'italic' ? 'optional' : 'swap'),
    unicodeRange: rangeList(FONT_SUBSETS[subset]),
    src: /** @type {[string]} */ ([`./${FONT_OUTPUT_DIR}/${subsetFile(face.file, subset)}`]),
  });
  return /** @type {const} */ ([variant('latin'), variant('cyrillic')]);
};

const [PIAZZOLLA, PIAZZOLLA_ITALIC, SOFIA_SANS] = FONT_FACES;

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
        variants: [...variants(PIAZZOLLA), ...variants(PIAZZOLLA_ITALIC)],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Sofia Sans',
      cssVariable: '--font-sofia-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [...variants(SOFIA_SANS)],
      },
    },
  ],
  integrations: [
    sitemap({ filter: (page) => !UNLISTED_PATHS.some((path) => page.endsWith(path)) }),
  ],
  vite: {
    // Never inline page scripts: the CSP allows only same-origin script files.
    build: { assetsInlineLimit: 0 },
  },
});
