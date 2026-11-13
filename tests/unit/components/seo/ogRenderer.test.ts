import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { headingFontSize, OG_HEADING, produceOgCard, siteOgCard } from '@components/seo/ogImage';
import { measureHeading, renderOgImage, renderOgRaster } from '@components/seo/ogRenderer';
import { Month } from '@contexts/seasonality';
import { palettes } from '@design/tokens';
import { aProduce } from '@tests/fixtures/produce';

const SITE = 'https://sezon.example';
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const IHDR_WIDTH_OFFSET = 16;
const IHDR_HEIGHT_OFFSET = 20;
const RENDER_TIMEOUT_MS = 30_000;
const PRODUCE_DIR = join(process.cwd(), 'src/data/produce');
const WIDTH = 1200;
const HEIGHT = 630;
const BAND_TOP = 526;
/** Rows of the band above its text, which must stay plain band colour. */
const BAND_CLEAR_ROWS = 12;
const PADDING_X = 72;
const CHANNELS = 4;
const NOVEMBER = Month.of(11);
const WORST_CASES = [
  'Щъркелов шипок',
  'Брюкселско зеле',
  'ЖЖЖЖЖЖЖЖЖЖЖ',
  'Щъркелов шипок и брюкселско зеле',
];

/** Returns the width and height from a PNG's IHDR chunk. */
function pngSize(png: Uint8Array): { width: number; height: number } {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return {
    width: view.getUint32(IHDR_WIDTH_OFFSET),
    height: view.getUint32(IHDR_HEIGHT_OFFSET),
  };
}

/** Returns `#rrggbb` of the pixel at (x, y) of an RGBA raster. */
function pixel(pixels: Uint8Array, x: number, y: number): string {
  const offset = (y * WIDTH + x) * CHANNELS;
  return `#${[...pixels.slice(offset, offset + 3)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Returns the distinct colours of the pixels in a rectangle. */
function coloursIn(
  pixels: Uint8Array,
  area: { x0: number; x1: number; y0: number; y1: number },
): ReadonlySet<string> {
  const colours = new Set<string>();
  for (let y = area.y0; y < area.y1; y += 1) {
    for (let x = area.x0; x < area.x1; x += 1) colours.add(pixel(pixels, x, y));
  }
  return colours;
}

/** Returns the names of every produce in the catalogue. */
function catalogueNames(): ReadonlyArray<string> {
  return readdirSync(PRODUCE_DIR)
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => (parse(readFileSync(join(PRODUCE_DIR, file), 'utf8')) as { name: string }).name);
}

describe('renderOgImage (spec 050)', () => {
  it(
    'AC6: renders a card to a 1200×630 PNG',
    async () => {
      const png = await renderOgImage(siteOgCard(), SITE);
      expect([...png.slice(0, PNG_SIGNATURE.length)]).toEqual(PNG_SIGNATURE);
      expect(pngSize(png)).toEqual({ width: WIDTH, height: HEIGHT });
    },
    RENDER_TIMEOUT_MS,
  );

  it(
    'AC6: renders a produce card with a stamp to a 1200×630 PNG',
    async () => {
      const produce = aProduce({
        slug: 'zelen-fasul',
        name: 'Зелен фасул',
        season: [{ month: 11, level: 'storage' }],
      });
      const png = await renderOgImage(produceOgCard(produce, NOVEMBER), SITE);
      expect(pngSize(png)).toEqual({ width: WIDTH, height: HEIGHT });
    },
    RENDER_TIMEOUT_MS,
  );
});

describe('heading fit (spec 050)', () => {
  it('AC12: every catalogue name fits on one line of the heading', async () => {
    const names = catalogueNames();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const metrics = await measureHeading(name);
      const size = headingFontSize(metrics);
      expect(size * metrics.lineEm, name).toBeLessThanOrEqual(OG_HEADING.widthPx);
    }
  });

  it('AC12: measures capitals with the real advance widths', async () => {
    const narrow = await measureHeading('ИИИИИ');
    const wide = await measureHeading('ЖЖЖЖЖ');
    expect(wide.lineEm).toBeGreaterThan(narrow.lineEm);
    expect((await measureHeading('ж')).lineEm).toBe((await measureHeading('Ж')).lineEm);
    expect((await measureHeading('Брюкселско зеле')).longestWordEm).toBe(
      (await measureHeading('Брюкселско')).lineEm,
    );
  });

  for (const name of WORST_CASES) {
    it(
      `AC12: „${name}“ stays inside the width and above the band, with its stamp visible`,
      async () => {
        const produce = aProduce({ slug: 'test', name, season: [{ month: 11, level: 'peak' }] });
        const metrics = await measureHeading(name);
        expect(headingFontSize(metrics) * metrics.longestWordEm).toBeLessThanOrEqual(
          OG_HEADING.widthPx,
        );
        const { pixels } = await renderOgRaster(produceOgCard(produce, NOVEMBER), SITE);
        const light = palettes.light;
        expect(
          coloursIn(pixels, { x0: 0, x1: WIDTH, y0: BAND_TOP, y1: BAND_TOP + BAND_CLEAR_ROWS }),
        ).toEqual(new Set([light.shell]));
        expect(
          coloursIn(pixels, { x0: WIDTH - PADDING_X + 1, x1: WIDTH, y0: 0, y1: BAND_TOP }),
        ).toEqual(new Set([light.background]));
        expect(coloursIn(pixels, { x0: 0, x1: WIDTH, y0: 0, y1: BAND_TOP }).has(light.peak)).toBe(
          true,
        );
      },
      RENDER_TIMEOUT_MS,
    );
  }
});
