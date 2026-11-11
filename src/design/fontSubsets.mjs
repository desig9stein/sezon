// @ts-check

/**
 * Characters kept in each self-hosted font subset, as CSS `unicode-range` values. Latin keeps
 * ASCII, the Latin-1 symbols (no-break space, ©, µ, °, ·, «», ×, ÷), general punctuation
 * („“ – — …), € and the minus; accented Latin letters fall back to the system font. Cyrillic
 * keeps the basic block (Bulgarian, Russian, Serbian letters) and №.
 */
export const FONT_SUBSETS = /** @type {const} */ ({
  latin: 'U+0020-007E,U+00A0-00BF,U+00D7,U+00F7,U+2010-2027,U+2030-203A,U+20AC,U+2212',
  cyrillic: 'U+0400-045F,U+2116',
});

/** @typedef {keyof typeof FONT_SUBSETS} FontSubset */

/**
 * Variable font faces the site self-hosts, each instanced to the weight range in use and generated
 * for its `subsets`. `file` is the Fontsource file name with a `{subset}` placeholder; the
 * generated file keeps that name in `src/assets/fonts/`.
 */
export const FONT_FACES = /** @type {const} */ ([
  {
    pkg: '@fontsource-variable/sofia-sans',
    file: 'sofia-sans-{subset}-wght-normal.woff2',
    style: 'normal',
    weight: { min: 400, max: 700 },
    subsets: ['latin', 'cyrillic'],
  },
  {
    pkg: '@fontsource-variable/sofia-sans',
    file: 'sofia-sans-{subset}-wght-italic.woff2',
    style: 'italic',
    weight: { min: 400, max: 400 },
    subsets: ['latin'],
  },
  {
    pkg: '@fontsource-variable/sofia-sans-extra-condensed',
    file: 'sofia-sans-extra-condensed-{subset}-wght-normal.woff2',
    style: 'normal',
    weight: { min: 800, max: 800 },
    subsets: ['latin', 'cyrillic'],
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
