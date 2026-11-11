// @ts-check

/**
 * Characters kept in each self-hosted font subset, as CSS `unicode-range` values. Latin keeps
 * Latin-1 (accented names in photo credits), general punctuation („“ – — …), € and the minus;
 * Cyrillic keeps the basic block (Bulgarian, Russian, Serbian letters) and №.
 */
export const FONT_SUBSETS = /** @type {const} */ ({
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212',
  cyrillic: 'U+0400-045F,U+2116',
});

/** @typedef {keyof typeof FONT_SUBSETS} FontSubset */

/**
 * Variable font faces the site self-hosts, each instanced to the weight range in use. `file` is
 * the Fontsource file name with a `{subset}` placeholder; the generated file keeps that name in
 * `src/assets/fonts/`.
 */
export const FONT_FACES = /** @type {const} */ ([
  {
    pkg: '@fontsource-variable/piazzolla',
    file: 'piazzolla-{subset}-wght-normal.woff2',
    style: 'normal',
    weight: { min: 400, max: 600 },
  },
  {
    pkg: '@fontsource-variable/piazzolla',
    file: 'piazzolla-{subset}-wght-italic.woff2',
    style: 'italic',
    weight: { min: 400, max: 600 },
  },
  {
    pkg: '@fontsource-variable/sofia-sans',
    file: 'sofia-sans-{subset}-wght-normal.woff2',
    style: 'normal',
    weight: { min: 400, max: 700 },
  },
]);

/** Directory of the generated font files, relative to the project root. */
export const FONT_OUTPUT_DIR = 'src/assets/fonts';

/**
 * Returns the file name of a face for one subset.
 * @param {string} file - File name with a `{subset}` placeholder.
 * @param {FontSubset} subset - Subset name.
 */
export const subsetFile = (file, subset) => file.replace('{subset}', subset);
