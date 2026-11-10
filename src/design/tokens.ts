/** Colour roles shared by the light and dark palettes. */
export interface Palette {
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly accentText: string;
  readonly border: string;
  readonly focus: string;
  readonly peak: string;
  readonly available: string;
  readonly storage: string;
  readonly onBadge: string;
}

/** Light and dark colour palettes. Contrast pairs are verified by unit tests. */
export const palettes: Readonly<Record<'light' | 'dark', Palette>> = {
  light: {
    background: '#fbfaf5',
    surface: '#ffffff',
    text: '#1f2a1c',
    textMuted: '#4b5746',
    accent: '#2e6629',
    accentText: '#ffffff',
    border: '#7d8a76',
    focus: '#b0441a',
    peak: '#f5d27a',
    available: '#c6e6bb',
    storage: '#ddd8cb',
    onBadge: '#1f2a1c',
  },
  dark: {
    background: '#131911',
    surface: '#1c2419',
    text: '#eef2e8',
    textMuted: '#b4bfaa',
    accent: '#93d483',
    accentText: '#10200c',
    border: '#738169',
    focus: '#ffb07a',
    peak: '#e2b450',
    available: '#8fcf7f',
    storage: '#bdb6a4',
    onBadge: '#10200c',
  },
};

/** Spacing scale in rem, keyed by step. */
export const space: Readonly<Record<string, string>> = {
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '6': '1.5rem',
  '8': '2rem',
  '12': '3rem',
  '16': '4rem',
};

/** Fluid type scale. */
export const fontSize: Readonly<Record<string, string>> = {
  sm: '0.875rem',
  base: '1rem',
  lg: 'clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)',
  xl: 'clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)',
  '2xl': 'clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)',
};

/** Non-colour design tokens. */
export const misc: Readonly<Record<string, string>> = {
  'font-family-base':
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
  'line-height-base': '1.6',
  'radius-sm': '0.375rem',
  'radius-md': '0.75rem',
  'content-width': '72rem',
  'reading-width': '42rem',
  'focus-width': '3px',
  'target-min': '2.75rem',
};

const toKebabCase = (name: string): string =>
  name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function declarations(entries: Record<string, string>, prefix: string): string {
  return Object.entries(entries)
    .map(([name, value]) => `--${prefix}${toKebabCase(name)}:${value};`)
    .join('');
}

/**
 * Renders all design tokens as CSS custom properties: light values on `:root`,
 * dark colour overrides inside `@media (prefers-color-scheme:dark)`.
 */
export function tokensToCss(): string {
  const root = [
    'color-scheme:light dark;',
    declarations({ ...palettes.light }, 'color-'),
    declarations({ ...space }, 'space-'),
    declarations({ ...fontSize }, 'font-size-'),
    declarations({ ...misc }, ''),
  ].join('');
  const dark = declarations({ ...palettes.dark }, 'color-');
  return `:root{${root}}@media (prefers-color-scheme:dark){:root{${dark}}}`;
}
