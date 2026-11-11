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
  /** Stamp red for „Разгар“; text on it uses `onPeak`. */
  readonly peak: string;
  readonly onPeak: string;
  readonly available: string;
  readonly storage: string;
  readonly onBadge: string;
  /** Stamp-blue header bar, its text and its focus ring. */
  readonly shell: string;
  readonly onShell: string;
  readonly focusOnShell: string;
  /** Marker-yellow highlight reserved for the current month, and text on it. */
  readonly marker: string;
  readonly onMarker: string;
}

/** Light and dark colour palettes (ADR-0006). Contrast pairs are verified by unit tests. */
export const palettes: Readonly<Record<'light' | 'dark', Palette>> = {
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
  'font-family-display':
    "var(--font-sofia-sans-extra-condensed),'Arial Narrow',sans-serif-condensed,sans-serif",
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
