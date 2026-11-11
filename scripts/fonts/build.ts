import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import subsetFont from 'subset-font';
import {
  FONT_FACES,
  FONT_OUTPUT_DIR,
  FONT_SUBSETS,
  type FontSubset,
  subsetFile,
} from '../../src/design/fontSubsets.mjs';

const require = createRequire(import.meta.url);
const HEX = 16;
/** OpenType features the site relies on: kerning, ligatures, Bulgarian forms, figures, marks. */
const KEPT_FEATURES = ['ccmp', 'locl', 'mark', 'mkmk', 'kern', 'liga', 'calt', 'tnum', 'lnum'];

/**
 * Expands a CSS `unicode-range` value into the string of its characters.
 * @param ranges - Comma-separated ranges such as `U+0400-045F,U+2116`.
 */
function charactersOf(ranges: string): string {
  return ranges
    .split(',')
    .flatMap((range) => {
      const [start = '', end = start] = range.replace('U+', '').split('-');
      const first = Number.parseInt(start, HEX);
      const last = Number.parseInt(end, HEX);
      return Array.from({ length: last - first + 1 }, (_, index) =>
        String.fromCodePoint(first + index),
      );
    })
    .join('');
}

/** Writes every face and subset, instanced to its weight range, as WOFF2 into the output dir. */
async function build(): Promise<void> {
  await mkdir(FONT_OUTPUT_DIR, { recursive: true });
  for (const face of FONT_FACES) {
    for (const subset of Object.keys(FONT_SUBSETS) as FontSubset[]) {
      const name = subsetFile(face.file, subset);
      const source = await readFile(require.resolve(`${face.pkg}/files/${name}`));
      const output = await subsetFont(source, charactersOf(FONT_SUBSETS[subset]), {
        targetFormat: 'woff2',
        keepFeatures: KEPT_FEATURES,
        variationAxes: { wght: { min: face.weight.min, max: face.weight.max } },
      });
      await writeFile(join(FONT_OUTPUT_DIR, name), output);
      console.log(`${name}: ${source.length} -> ${output.length} bytes`);
    }
  }
}

await build();
