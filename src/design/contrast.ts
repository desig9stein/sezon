const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const SRGB_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722] as const;
const CONTRAST_OFFSET = 0.05;
const CHANNEL_MAX = 255;

function channels(hex: string): [number, number, number] {
  if (!HEX_COLOR.test(hex)) {
    throw new TypeError(`"${hex}" is not a #rgb or #rrggbb colour.`);
  }
  const digits = hex.slice(1);
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
  return [0, 2, 4].map((start) => parseInt(full.slice(start, start + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function linearise(channel: number): number {
  const value = channel / CHANNEL_MAX;
  return value <= SRGB_THRESHOLD
    ? value / SRGB_LINEAR_DIVISOR
    : ((value + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA;
}

/** Returns the WCAG 2.x relative luminance of a hex colour (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  return channels(hex).reduce(
    (sum, channel, index) => sum + linearise(channel) * (LUMINANCE_WEIGHTS[index] ?? 0),
    0,
  );
}

/**
 * Returns the WCAG 2.x contrast ratio between two hex colours, from 1 to 21.
 * @throws TypeError when a colour is not `#rgb` or `#rrggbb`.
 */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
}
