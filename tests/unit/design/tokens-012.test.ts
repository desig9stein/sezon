import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@design/contrast';
import { palettes, tokensToCss, type Palette } from '@design/tokens';
import { REQUIRED_CONTRAST_PAIRS } from '@tests/fixtures/contrastPairs';

const ADR_0004: Readonly<Record<'light' | 'dark', Palette>> = {
  light: {
    background: '#ffffff',
    surface: '#eef3ea',
    text: '#16241b',
    textMuted: '#4a5b50',
    accent: '#8a1c3f',
    accentText: '#ffffff',
    border: '#7c8c80',
    rule: '#c9d2c6',
    focus: '#1f5fa8',
    peak: '#b9dca3',
    available: '#dfe9c8',
    storage: '#dcd6e6',
    onBadge: '#16241b',
  },
  dark: {
    background: '#111a14',
    surface: '#1a251e',
    text: '#e7eee6',
    textMuted: '#a8b8ac',
    accent: '#f29ab2',
    accentText: '#2a0b16',
    border: '#6f8174',
    rule: '#2c3a31',
    focus: '#8cc2ff',
    peak: '#446f3b',
    available: '#3f5a3a',
    storage: '#4a4560',
    onBadge: '#f1f5ef',
  },
};

describe('design tokens (spec 012)', () => {
  it('AC1: the palettes equal ADR-0004', () => {
    expect(palettes).toEqual(ADR_0004);
  });

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

  it('AC3: emits font families with fallbacks and the full type scale', () => {
    const css = tokensToCss();
    expect(css).toContain('--font-family-display:var(--font-piazzolla),Georgia,serif;');
    expect(css).toContain('--font-family-base:var(--font-sofia-sans),system-ui,sans-serif;');
    for (const step of ['sm', 'base', 'lg', 'xl', '2xl', '3xl', 'display']) {
      expect(css).toMatch(new RegExp(`--font-size-${step}:`));
    }
    expect(css).toContain('--color-rule:#c9d2c6;');
    expect(css.slice(css.indexOf('@media'))).toContain('--color-rule:#2c3a31;');
  });
});
