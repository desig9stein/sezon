import { type RenderedImage, Resvg } from '@resvg/resvg-js';
import { create, type Font as FontFile } from 'fontkitten';
import satori, { type Font, type FontWeight } from 'satori';
import subsetFont from 'subset-font';
import bodyCyrillic from '../../assets/fonts/sofia-sans-cyrillic-wght-normal.woff2?inline';
import bodyLatin from '../../assets/fonts/sofia-sans-latin-wght-normal.woff2?inline';
import displayCyrillic from '../../assets/fonts/sofia-sans-extra-condensed-cyrillic-wght-normal.woff2?inline';
import displayLatin from '../../assets/fonts/sofia-sans-extra-condensed-latin-wght-normal.woff2?inline';
import { palettes } from '@design/tokens';
import {
  headingFontSize,
  OG_IMAGE,
  type HeadingMetrics,
  type OgCard,
  type OgStampTone,
} from './ogImage';

const colors = palettes.light;

/** Self-hosted font subsets (spec 015) as data URLs, Cyrillic first: the fallback order. */
const FONT_FILES = {
  display: { cyrillic: displayCyrillic, latin: displayLatin },
  body: { cyrillic: bodyCyrillic, latin: bodyLatin },
} as const;
const SUBSETS = ['cyrillic', 'latin'] as const;
const HEADING_LOCALE = 'bg';
const WORD_SEPARATOR = /\s+/u;
const DISPLAY = 'Sofia Sans Extra Condensed';
const BODY = 'Sofia Sans';
const DISPLAY_WEIGHT = 800;
const REGULAR: FontWeight = 400;
const SEMIBOLD: FontWeight = 600;
const BODY_WEIGHTS: ReadonlyArray<FontWeight> = [REGULAR, SEMIBOLD];

const PADDING_X = 72;
const PADDING_TOP = 56;
const BAND_HEIGHT = 104;
const KICKER_SIZE = 36;
const DETAIL_SIZE = 40;
const STAMP_SIZE = 52;
const BRAND_SIZE = 60;
const HOST_SIZE = 32;
const BORDER_WIDTH = 5;
const STAMP_ROTATION = 'rotate(-3deg)';
const HEADING_LINE_HEIGHT = 0.95;
const DETAIL_LINE_HEIGHT = 1.3;
const DETAIL_MAX_WIDTH = 1000;
const HEADING_GAP = 8;
const DETAIL_GAP = 28;
const STAMP_ROW_GAP = 36;
const STAMP_DETAIL_GAP = 28;
const STAMP_LETTER_SPACING = '0.06em';
const BRAND_LETTER_SPACING = '0.04em';
const STAMP_PADDING = '0.1em 0.45em';

/** A satori element: a tag, its style and its children. */
interface Node {
  readonly type: string;
  readonly props: {
    readonly style: Readonly<Record<string, string | number>>;
    readonly children?: string | ReadonlyArray<Node>;
  };
}

/** Returns a satori element. */
const node = (
  style: Readonly<Record<string, string | number>>,
  children?: string | ReadonlyArray<Node>,
): Node => ({ type: 'div', props: { style, ...(children === undefined ? {} : { children }) } });

/** Returns a font family list with the Cyrillic subset first and the Latin subset as fallback. */
const families = (family: string): string =>
  SUBSETS.map((subset) => `${family} ${subset}`).join(', ');

/** Returns the bytes of a base64 data URL. */
const bytesOf = (dataUrl: string): Buffer =>
  Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');

/** Loads the display font and the body font pinned to each body weight, one family per subset. */
async function loadFonts(): Promise<ReadonlyArray<Font>> {
  const fonts = SUBSETS.flatMap((subset) => [
    Promise.resolve<Font>({
      name: `${DISPLAY} ${subset}`,
      data: bytesOf(FONT_FILES.display[subset]),
      weight: DISPLAY_WEIGHT,
      style: 'normal',
    }),
    ...BODY_WEIGHTS.map(async (weight): Promise<Font> => {
      const data = await subsetFont(bytesOf(FONT_FILES.body[subset]), undefined, {
        keepAllGlyphs: true,
        targetFormat: 'sfnt',
        variationAxes: { wght: weight },
      });
      return { name: `${BODY} ${subset}`, data, weight, style: 'normal' };
    }),
  ]);
  return Promise.all(fonts);
}

let fontsOnce: Promise<ReadonlyArray<Font>> | undefined;

/** Returns the card fonts, loading them once per process. */
function cardFonts(): Promise<ReadonlyArray<Font>> {
  fontsOnce ??= loadFonts();
  return fontsOnce;
}

let headingFontFiles: ReadonlyArray<FontFile> | undefined;

/** Returns the display font subsets parsed for measuring, Cyrillic first. */
function headingFonts(): ReadonlyArray<FontFile> {
  headingFontFiles ??= SUBSETS.map((subset) => {
    const font = create(bytesOf(FONT_FILES.display[subset]));
    if (font.isCollection) throw new TypeError(`Unexpected font collection for ${subset}.`);
    return font;
  });
  return headingFontFiles;
}

/** Returns the advance width of `text` in em, each character from the first subset that has it. */
function widthEm(text: string): number {
  const fonts = headingFonts();
  return [...text].reduce((total, character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    const font = fonts.find((candidate) => candidate.hasGlyphForCodePoint(codePoint)) ?? fonts[0];
    if (font === undefined) return total;
    return total + font.glyphForCodePoint(codePoint).advanceWidth / font.unitsPerEm;
  }, 0);
}

/**
 * Measures a heading as drawn: in capitals, in Sofia Sans Extra Condensed 800, with the real
 * advance widths of its glyphs.
 */
export async function measureHeading(text: string): Promise<HeadingMetrics> {
  const capitals = text.toLocaleUpperCase(HEADING_LOCALE);
  const words = capitals.split(WORD_SEPARATOR).filter((word) => word !== '');
  return {
    lineEm: widthEm(capitals),
    longestWordEm: Math.max(0, ...words.map(widthEm)),
  };
}

const STAMP_STYLES: Readonly<Record<OgStampTone, Readonly<Record<string, string | number>>>> = {
  peak: {
    backgroundColor: colors.peak,
    color: colors.onPeak,
    border: `${BORDER_WIDTH}px solid ${colors.peak}`,
  },
  available: {
    backgroundColor: colors.surface,
    color: colors.accent,
    border: `${BORDER_WIDTH}px solid ${colors.accent}`,
  },
  storage: {
    backgroundColor: colors.surface,
    color: colors.text,
    border: `${BORDER_WIDTH}px dashed ${colors.text}`,
  },
  out: {
    backgroundColor: colors.surface,
    color: colors.textMuted,
    border: `${BORDER_WIDTH}px solid ${colors.border}`,
  },
};

/** Returns the stamp-and-detail row, or the detail alone when the card has no stamp. */
function detailRow(card: OgCard): Node {
  const detail = node(
    {
      fontFamily: families(BODY),
      fontWeight: card.stamp === undefined ? REGULAR : SEMIBOLD,
      fontSize: DETAIL_SIZE,
      lineHeight: DETAIL_LINE_HEIGHT,
    },
    card.detail,
  );
  if (card.stamp === undefined) {
    return node({ display: 'flex', marginTop: DETAIL_GAP, maxWidth: DETAIL_MAX_WIDTH }, [detail]);
  }
  const stamp = node(
    {
      ...STAMP_STYLES[card.stamp.tone],
      fontFamily: families(DISPLAY),
      fontWeight: DISPLAY_WEIGHT,
      fontSize: STAMP_SIZE,
      letterSpacing: STAMP_LETTER_SPACING,
      textTransform: 'uppercase',
      padding: STAMP_PADDING,
      transform: STAMP_ROTATION,
      marginRight: STAMP_DETAIL_GAP,
    },
    card.stamp.text,
  );
  return node({ display: 'flex', alignItems: 'center', marginTop: STAMP_ROW_GAP }, [stamp, detail]);
}

/**
 * Returns the element tree of a card. The main column cannot grow past the space above the band
 * and hides anything that would not fit.
 */
function cardTree(card: OgCard, host: string, headingSize: number): Node {
  const main = node(
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flexGrow: 1,
      minHeight: 0,
      overflow: 'hidden',
      padding: `${PADDING_TOP}px ${PADDING_X}px 0`,
    },
    [
      ...(card.kicker === undefined
        ? []
        : [
            node(
              {
                fontFamily: families(BODY),
                fontWeight: SEMIBOLD,
                fontSize: KICKER_SIZE,
                color: colors.textMuted,
              },
              card.kicker,
            ),
          ]),
      node(
        {
          fontFamily: families(DISPLAY),
          fontWeight: DISPLAY_WEIGHT,
          fontSize: headingSize,
          lineHeight: HEADING_LINE_HEIGHT,
          textTransform: 'uppercase',
          color: colors.accent,
          marginTop: HEADING_GAP,
        },
        card.heading,
      ),
      detailRow(card),
    ],
  );
  const band = node(
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: card.brand === undefined ? 'flex-end' : 'space-between',
      height: BAND_HEIGHT,
      flexShrink: 0,
      padding: `0 ${PADDING_X}px`,
      backgroundColor: colors.shell,
      color: colors.onShell,
    },
    [
      ...(card.brand === undefined
        ? []
        : [
            node(
              {
                fontFamily: families(DISPLAY),
                fontWeight: DISPLAY_WEIGHT,
                fontSize: BRAND_SIZE,
                letterSpacing: BRAND_LETTER_SPACING,
                textTransform: 'uppercase',
              },
              card.brand,
            ),
          ]),
      node({ fontFamily: families(BODY), fontWeight: SEMIBOLD, fontSize: HOST_SIZE }, host),
    ],
  );
  return node(
    {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: colors.background,
      color: colors.text,
    },
    [main, band],
  );
}

/** Renders a card with the site's light palette and self-hosted fonts. */
async function renderCard(card: OgCard, siteUrl: string): Promise<RenderedImage> {
  const headingSize = headingFontSize(await measureHeading(card.heading));
  const svg = await satori(cardTree(card, new URL(siteUrl).host, headingSize), {
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    fonts: [...(await cardFonts())],
  });
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_IMAGE.width },
    font: { loadSystemFonts: false },
  }).render();
}

/**
 * Renders a card to 1200×630 RGBA pixels.
 * @param siteUrl - Site origin; its host is printed in the bottom band.
 */
export async function renderOgRaster(
  card: OgCard,
  siteUrl: string,
): Promise<{ readonly width: number; readonly height: number; readonly pixels: Uint8Array }> {
  const image = await renderCard(card, siteUrl);
  return { width: image.width, height: image.height, pixels: new Uint8Array(image.pixels) };
}

/**
 * Renders a card to a 1200×630 PNG.
 * @param siteUrl - Site origin; its host is printed in the bottom band.
 */
export async function renderOgImage(
  card: OgCard,
  siteUrl: string,
): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array((await renderCard(card, siteUrl)).asPng());
}
