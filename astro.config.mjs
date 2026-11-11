// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const NOT_FOUND_PATH = '/404';

/** Fontsource unicode ranges of the Cyrillic and Latin subsets. */
const CYRILLIC = ['U+0301', 'U+0400-045F', 'U+0490-0491', 'U+04B0-04B1', 'U+2116'];
const LATIN = [
  'U+0000-00FF',
  'U+0131',
  'U+0152-0153',
  'U+02BB-02BC',
  'U+02C6',
  'U+02DA',
  'U+02DC',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+2000-206F',
  'U+20AC',
  'U+2122',
  'U+2191',
  'U+2193',
  'U+2212',
  'U+2215',
  'U+FEFF',
  'U+FFFD',
];

/**
 * Returns one local font variant per subset for a Fontsource variable font file pattern.
 * @param {string} pkg - Package name, e.g. `@fontsource-variable/piazzolla`.
 * @param {string} file - File name with `{subset}` placeholder.
 * @param {{ weight: string; style: 'normal' | 'italic' }} face - Weight range and style.
 */
const subsets = (pkg, file, face) =>
  [
    { subset: 'cyrillic', unicodeRange: CYRILLIC },
    { subset: 'latin', unicodeRange: LATIN },
  ].map(({ subset, unicodeRange }) => ({
    ...face,
    display: /** @type {const} */ ('swap'),
    unicodeRange,
    src: [`${pkg}/files/${file.replace('{subset}', subset)}`],
  }));
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://sezon.example';

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
          ...subsets('@fontsource-variable/piazzolla', 'piazzolla-{subset}-opsz-normal.woff2', {
            weight: '100 900',
            style: 'normal',
          }),
          ...subsets('@fontsource-variable/piazzolla', 'piazzolla-{subset}-wght-italic.woff2', {
            weight: '100 900',
            style: 'italic',
          }),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Sofia Sans',
      cssVariable: '--font-sofia-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: subsets(
          '@fontsource-variable/sofia-sans',
          'sofia-sans-{subset}-wght-normal.woff2',
          {
            weight: '1 1000',
            style: 'normal',
          },
        ),
      },
    },
  ],
  integrations: [sitemap({ filter: (page) => !page.endsWith(NOT_FOUND_PATH) })],
});
