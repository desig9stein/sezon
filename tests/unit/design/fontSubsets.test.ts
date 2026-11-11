import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FONT_FACES, FONT_OUTPUT_DIR, subsetFile } from '@design/fontSubsets.mjs';

/** Byte budget of the upright files the layout preloads, so a photo can still be the fast LCP. */
const PRELOAD_BUDGET_BYTES = 75_000;
/** Byte budget of all font files (spec 022, from the audit for #79). */
const TOTAL_BUDGET_BYTES = 110_000;

describe('self-hosted font subsets', () => {
  it('QA 015: every face has a generated file per subset', () => {
    const missing = FONT_FACES.flatMap((face) =>
      face.subsets
        .map((subset) => subsetFile(face.file, subset))
        .filter((name) => !existsSync(join(FONT_OUTPUT_DIR, name))),
    );
    expect(missing).toEqual([]);
  });

  it('QA 015: the preloaded upright files stay within the byte budget', () => {
    const bytes = FONT_FACES.filter((face) => face.style === 'normal')
      .flatMap((face) => face.subsets.map((subset) => subsetFile(face.file, subset)))
      .reduce((total, name) => total + statSync(join(FONT_OUTPUT_DIR, name)).size, 0);
    expect(bytes).toBeLessThanOrEqual(PRELOAD_BUDGET_BYTES);
  });

  it('AC4 (022): the faces are Sofia Sans, its Latin italic and Sofia Sans Extra Condensed', () => {
    expect(
      FONT_FACES.map(({ pkg, style, weight, subsets }) => ({ pkg, style, weight, subsets })),
    ).toEqual([
      {
        pkg: '@fontsource-variable/sofia-sans',
        style: 'normal',
        weight: { min: 400, max: 700 },
        subsets: ['latin', 'cyrillic'],
      },
      {
        pkg: '@fontsource-variable/sofia-sans',
        style: 'italic',
        weight: { min: 400, max: 400 },
        subsets: ['latin'],
      },
      {
        pkg: '@fontsource-variable/sofia-sans-extra-condensed',
        style: 'normal',
        weight: { min: 800, max: 800 },
        subsets: ['latin', 'cyrillic'],
      },
    ]);
  });

  it('AC4 (022): all font files together stay within the 110 KB budget, no Piazzolla left', () => {
    const files = readdirSync(FONT_OUTPUT_DIR);
    expect(files.filter((name) => name.includes('piazzolla'))).toEqual([]);
    const bytes = files.reduce(
      (total, name) => total + statSync(join(FONT_OUTPUT_DIR, name)).size,
      0,
    );
    expect(bytes).toBeLessThanOrEqual(TOTAL_BUDGET_BYTES);
  });
});
