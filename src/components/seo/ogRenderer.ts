import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori, { type Font, type FontWeight } from 'satori';
import subsetFont from 'subset-font';
import { FONT_OUTPUT_DIR, type FontSubset, subsetFile } from '@design/fontSubsets.mjs';
import { palettes } from '@design/tokens';
import { OG_IMAGE, type OgCard, type OgStampTone } from './ogImage';

const colors = palettes.light;

const DISPLAY_FILE = 'sofia-sans-extra-condensed-{subset}-wght-normal.woff2';
const BODY_FILE = 'sofia-sans-{subset}-wght-normal.woff2';
const SUBSETS = ['cyrillic', 'latin'] as const;
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

/**
 * Loads the self-hosted font subsets (spec 015). Satori draws only the default instance of a
 * variable font, so Sofia Sans is pinned to each body weight; Sofia Sans Extra Condensed is
 * already static at 800. Each subset is its own family, since satori falls back between families.
 */
async function loadFonts(): Promise<ReadonlyArray<Font>> {
  const read = (file: string, subset: FontSubset) =>
    readFile(join(process.cwd(), FONT_OUTPUT_DIR, subsetFile(file, subset)));
  const fonts = SUBSETS.flatMap((subset) => [
    read(DISPLAY_FILE, subset).then((data): Font => ({
      name: `${DISPLAY} ${subset}`,
      data,
      weight: DISPLAY_WEIGHT,
      style: 'normal',
    })),
    ...BODY_WEIGHTS.map(async (weight): Promise<Font> => {
      const data = await subsetFont(await read(BODY_FILE, subset), undefined, {
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

/** Returns the element tree of a card. */
function cardTree(card: OgCard, host: string): Node {
  const main = node(
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flexGrow: 1,
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
          fontSize: card.headingSize,
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

/**
 * Renders a card to a 1200×630 PNG with the site's light palette and self-hosted fonts.
 * @param siteUrl - Site origin; its host is printed in the bottom band.
 */
export async function renderOgImage(
  card: OgCard,
  siteUrl: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(cardTree(card, new URL(siteUrl).host), {
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    fonts: [...(await cardFonts())],
  });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_IMAGE.width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  return new Uint8Array(png);
}
