import { describe, expect, it } from 'vitest';
import { produceOgCard, siteOgCard } from '@components/seo/ogImage';
import { renderOgImage } from '@components/seo/ogRenderer';
import { Month } from '@contexts/seasonality';
import { aProduce } from '@tests/fixtures/produce';

const SITE = 'https://sezon.example';
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const IHDR_WIDTH_OFFSET = 16;
const IHDR_HEIGHT_OFFSET = 20;
const RENDER_TIMEOUT_MS = 30_000;

/** Returns the width and height from a PNG's IHDR chunk. */
function pngSize(png: Uint8Array): { width: number; height: number } {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return {
    width: view.getUint32(IHDR_WIDTH_OFFSET),
    height: view.getUint32(IHDR_HEIGHT_OFFSET),
  };
}

describe('renderOgImage (spec 050)', () => {
  it(
    'AC6: renders a card to a 1200×630 PNG',
    async () => {
      const png = await renderOgImage(siteOgCard(), SITE);
      expect([...png.slice(0, PNG_SIGNATURE.length)]).toEqual(PNG_SIGNATURE);
      expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
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
      const png = await renderOgImage(produceOgCard(produce, Month.of(11)), SITE);
      expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
    },
    RENDER_TIMEOUT_MS,
  );
});
