import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FONT_FACES,
  FONT_OUTPUT_DIR,
  FONT_SUBSETS,
  type FontSubset,
  subsetFile,
} from '@design/fontSubsets.mjs';

/** Byte budget of the upright files the layout preloads, so a photo can still be the fast LCP. */
const PRELOAD_BUDGET_BYTES = 75_000;
const SUBSETS = Object.keys(FONT_SUBSETS) as FontSubset[];

describe('self-hosted font subsets', () => {
  it('QA 015: every face has a generated file per subset', () => {
    const missing = FONT_FACES.flatMap((face) =>
      SUBSETS.map((subset) => subsetFile(face.file, subset)).filter(
        (name) => !existsSync(join(FONT_OUTPUT_DIR, name)),
      ),
    );
    expect(missing).toEqual([]);
  });

  it('QA 015: the preloaded upright files stay within the byte budget', () => {
    const bytes = FONT_FACES.filter((face) => face.style === 'normal')
      .flatMap((face) => SUBSETS.map((subset) => subsetFile(face.file, subset)))
      .reduce((total, name) => total + statSync(join(FONT_OUTPUT_DIR, name)).size, 0);
    expect(bytes).toBeLessThanOrEqual(PRELOAD_BUDGET_BYTES);
  });
});
