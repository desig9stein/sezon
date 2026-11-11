import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@design/contrast';
import { palettes } from '@design/tokens';
import { REQUIRED_CONTRAST_PAIRS } from '@tests/fixtures/contrastPairs';

describe('design tokens (spec 012)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    it.each(REQUIRED_CONTRAST_PAIRS)(
      `AC2: ${scheme} %s on %s ≥ %s:1`,
      (foreground, background, minimum) => {
        const palette = palettes[scheme];
        expect(contrastRatio(palette[foreground], palette[background])).toBeGreaterThanOrEqual(
          minimum,
        );
      },
    );
  }
});
