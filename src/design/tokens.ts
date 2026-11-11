/** Colour roles shared by the light and dark palettes. */
export interface Palette {
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly accentText: string;
  readonly border: string;
  /** Decorative hairline colour; never used for text or control boundaries. */
  readonly rule: string;
  readonly focus: string;
  readonly peak: string;
  readonly available: string;
  readonly storage: string;
  readonly onBadge: string;
}

/** Light and dark colour palettes (ADR-0004). Contrast pairs are verified by unit tests. */
export const palettes: Readonly<Record<'light' | 'dark', Palette>> = {
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

/** Fluid type scale (ADR-0004). */
export const fontSize: Readonly<Record<string, string>> = {
  sm: '0.9375rem',
  base: '1.0625rem',
  lg: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.6rem)',
  xl: 'clamp(1.5rem, 1.25rem + 1vw, 2.1rem)',
  '2xl': 'clamp(1.6rem, 1.3rem + 1.4vw, 2.2rem)',
  '3xl': 'clamp(3.5rem, 2rem + 6vw, 6.5rem)',
  display: 'clamp(4.5rem, 1rem + 15vw, 13.5rem)',
};

/** Non-colour design tokens. */
export const misc: Readonly<Record<string, string>> = {
  'font-family-display': 'var(--font-piazzolla),Georgia,serif',
  'font-family-base': 'var(--font-sofia-sans),system-ui,sans-serif',
  'line-height-base': '1.55',
  'line-height-heading': '1.15',
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
