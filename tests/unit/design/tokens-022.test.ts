import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@design/contrast';
import { palettes, tokensToCss, type Palette } from '@design/tokens';
import { REQUIRED_CONTRAST_PAIRS } from '@tests/fixtures/contrastPairs';

/** The stamp-of-origin palettes (ADR-0006). */
const ADR_0006: Readonly<Record<'light' | 'dark', Palette>> = {
  light: {
    background: '#f4f6fb',
    surface: '#ffffff',
    text: '#141a2e',
    textMuted: '#4a5270',
    accent: '#1c3faa',
    accentText: '#ffffff',
    border: '#6b7395',
    rule: '#c9cfe2',
    focus: '#b45309',
    peak: '#c8102e',
    onPeak: '#ffffff',
    available: '#e3e9fb',
    storage: '#ebe6f5',
    onBadge: '#141a2e',
    shell: '#1c3faa',
    onShell: '#ffffff',
    focusOnShell: '#ffb000',
    marker: '#ffb000',
    onMarker: '#141a2e',
  },
  dark: {
    background: '#0d1430',
    surface: '#141c3d',
    text: '#eef1fb',
    textMuted: '#a9b1d1',
    accent: '#9db3ff',
    accentText: '#0d1430',
    border: '#7480ad',
    rule: '#2b3666',
    focus: '#ffc23d',
    peak: '#ff6b7f',
    onPeak: '#0d1430',
    available: '#26346e',
    storage: '#352d5c',
    onBadge: '#eef1fb',
    shell: '#22337a',
    onShell: '#ffffff',
    focusOnShell: '#ffc23d',
    marker: '#ffc23d',
    onMarker: '#0d1430',
  },
};

describe('stamp-of-origin tokens (spec 022)', () => {
  it('AC1: the palettes equal ADR-0006', () => {
    expect(palettes).toEqual(ADR_0006);
  });

  it('AC2: the contrast list covers the new roles', () => {
    const pairs = REQUIRED_CONTRAST_PAIRS.map(([fg, bg]) => `${fg}/${bg}`);
    expect(pairs).toEqual(
      expect.arrayContaining([
        'onShell/shell',
        'focusOnShell/shell',
        'onPeak/peak',
        'onMarker/marker',
      ]),
    );
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

  it('AC3: emits the condensed display family and the Sofia Sans base family', () => {
    const css = tokensToCss();
    expect(css).toContain(
      "--font-family-display:var(--font-sofia-sans-extra-condensed),'Arial Narrow',sans-serif-condensed,sans-serif;",
    );
    expect(css).toContain('--font-family-base:var(--font-sofia-sans),system-ui,sans-serif;');
    expect(css).toContain('--color-shell:#1c3faa;');
    expect(css.slice(css.indexOf('@media'))).toContain('--color-shell:#22337a;');
  });
});
