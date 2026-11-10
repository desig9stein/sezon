import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@design/contrast';
import { palettes, tokensToCss, type Palette } from '@design/tokens';

type Pair = [foreground: keyof Palette, background: keyof Palette, minimum: number];

const REQUIRED_PAIRS: Pair[] = [
  ['text', 'background', 4.5],
  ['text', 'surface', 4.5],
  ['textMuted', 'background', 4.5],
  ['textMuted', 'surface', 4.5],
  ['accent', 'background', 4.5],
  ['accent', 'surface', 4.5],
  ['accentText', 'accent', 4.5],
  ['onBadge', 'peak', 4.5],
  ['onBadge', 'available', 4.5],
  ['onBadge', 'storage', 4.5],
  ['focus', 'background', 3],
  ['border', 'background', 3],
];

describe('contrastRatio', () => {
  it('AC6: returns 21 for black on white and 1 for identical colours', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });

  it('rejects colours that are not hex', () => {
    expect(() => contrastRatio('red', '#000')).toThrow();
  });
});

describe('palettes', () => {
  for (const [scheme, palette] of Object.entries(palettes)) {
    it.each(REQUIRED_PAIRS)(`AC5: ${scheme} %s on %s ≥ %s:1`, (foreground, background, minimum) => {
      expect(contrastRatio(palette[foreground], palette[background])).toBeGreaterThanOrEqual(
        minimum,
      );
    });
  }
});

describe('tokensToCss', () => {
  it('AC7: emits every colour token for light and dark schemes', () => {
    const css = tokensToCss();
    expect(css).toContain(':root{');
    expect(css).toContain('color-scheme:light dark');
    expect(css).toContain('@media (prefers-color-scheme:dark){:root{');
    for (const [name, value] of Object.entries(palettes.light)) {
      expect(css).toContain(
        `--color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`,
      );
    }
    for (const value of Object.values(palettes.dark)) {
      expect(css).toContain(value);
    }
    expect(css).toMatch(/--space-\d+:/);
    expect(css).toMatch(/--font-size-\w+:/);
  });
});
