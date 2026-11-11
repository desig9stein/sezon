// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import {
  FONT_FACES,
  FONT_OUTPUT_DIR,
  FONT_SUBSETS,
  subsetFile,
} from './src/design/fontSubsets.mjs';

const NOT_FOUND_PATH = '/404';
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://sezon.example';

/**
 * Splits a unicode-range string into a non-empty list of ranges.
 * @param {string} ranges - Comma-separated ranges, e.g. `U+0400-045F,U+2116`.
 */
const rangeList = (ranges) => /** @type {[string, ...string[]]} */ (ranges.split(','));

/**
 * Returns the local font variants of a generated face (`pnpm fonts:build`), one per subset in
 * the face's `subsets`. Latin comes first: Astro measures the fallback metrics from the first
 * file, and those metrics need Latin letters.
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
  return /** @type {[ReturnType<typeof variant>, ...ReturnType<typeof variant>[]]} */ (
    face.subsets.map(variant)
  );
};

const [SOFIA_SANS, SOFIA_SANS_ITALIC, SOFIA_SANS_EXTRA_CONDENSED] = FONT_FACES;

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
      name: 'Sofia Sans Extra Condensed',
      cssVariable: '--font-sofia-sans-extra-condensed',
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: {
        variants: [...variants(SOFIA_SANS_EXTRA_CONDENSED)],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Sofia Sans',
      cssVariable: '--font-sofia-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [...variants(SOFIA_SANS), ...variants(SOFIA_SANS_ITALIC)],
      },
    },
  ],
  integrations: [sitemap({ filter: (page) => !page.endsWith(NOT_FOUND_PATH) })],
  vite: {
    // Never inline page scripts: the CSP allows only same-origin script files.
    build: { assetsInlineLimit: 0 },
  },
});
