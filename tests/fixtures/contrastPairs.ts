import type { Palette } from '@design/tokens';

/** A colour pair that must meet a WCAG contrast minimum. */
export type ContrastPair = readonly [
  foreground: keyof Palette,
  background: keyof Palette,
  minimum: number,
];

/** Every foreground/background pair the components use, with its WCAG AA minimum. */
export const REQUIRED_CONTRAST_PAIRS: ReadonlyArray<ContrastPair> = [
  ['text', 'background', 4.5],
  ['text', 'surface', 4.5],
  ['textMuted', 'background', 4.5],
  ['textMuted', 'surface', 4.5],
  ['accent', 'background', 4.5],
  ['accent', 'surface', 4.5],
  ['accentText', 'accent', 4.5],
  ['onPeak', 'peak', 4.5],
  ['onBadge', 'available', 4.5],
  ['onBadge', 'storage', 4.5],
  ['focus', 'background', 3],
  ['focus', 'surface', 3],
  ['border', 'background', 3],
  ['border', 'surface', 3],
  ['accent', 'background', 3],
  ['onShell', 'shell', 4.5],
  ['focusOnShell', 'shell', 3],
  ['onMarker', 'marker', 4.5],
  ['peak', 'surface', 3],
  ['peak', 'background', 3],
];
