import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const DIST = join(process.cwd(), 'dist');
const OG_DIR = join(DIST, 'og');
const PRODUCE_SECTIONS = ['plodove', 'zelenchutsi', 'podpravki', 'yadki'];
const MONTHS_IN_YEAR = 12;
const IHDR_WIDTH_OFFSET = 16;
const IHDR_HEIGHT_OFFSET = 20;
const OG_IMAGE = /<meta property="og:image" content="([^"]+)">/g;
const OG_IMAGE_ALT = /<meta property="og:image:alt" content="([^"]*)">/;

/** Returns the paths of all HTML pages in `dist`, relative to it, except Pagefind's assets. */
function builtPages(): ReadonlyArray<string> {
  return readdirSync(DIST, { recursive: true, encoding: 'utf8' }).filter(
    (file) => file.endsWith('.html') && !file.startsWith('pagefind'),
  );
}

/** Returns the `og:image` URLs of a built page. */
function ogImages(page: string): ReadonlyArray<string> {
  const html = readFileSync(join(DIST, page), 'utf8');
  return [...html.matchAll(OG_IMAGE)].map((match) => match[1] ?? '');
}

/** Returns the width and height of a PNG file, or `undefined` when it is not a PNG. */
function pngSize(file: string): { width: number; height: number } | undefined {
  const png = readFileSync(file);
  if (png.toString('ascii', 1, 4) !== 'PNG') return undefined;
  return {
    width: png.readUInt32BE(IHDR_WIDTH_OFFSET),
    height: png.readUInt32BE(IHDR_HEIGHT_OFFSET),
  };
}

/** Returns the `dist` file of an absolute image URL. */
const distFile = (url: string): string => join(DIST, new URL(url).pathname);

test.describe('Open Graph images (spec 050)', () => {
  test('AC8: the home, a month and a produce page link their own card', () => {
    expect(ogImages('index.html').map((url) => new URL(url).pathname)).toEqual(['/og/site.png']);
    expect(ogImages('sezon/noemvri.html').map((url) => new URL(url).pathname)).toEqual([
      '/og/sezon/noemvri.png',
    ]);
    const produce = readdirSync(join(DIST, 'plodove')).find((file) => file.endsWith('.html'));
    expect(produce).toBeDefined();
    const slug = (produce ?? '').replace('.html', '');
    expect(ogImages(`plodove/${produce}`).map((url) => new URL(url).pathname)).toEqual([
      `/og/plodove/${slug}.png`,
    ]);
  });

  test('AC9: every page links one existing 1200×630 PNG with an alt text', () => {
    for (const page of builtPages()) {
      const images = ogImages(page);
      expect(images, page).toHaveLength(1);
      const file = distFile(images[0] ?? '');
      expect(existsSync(file), `${page} → ${file}`).toBe(true);
      expect(pngSize(file), file).toEqual({ width: 1200, height: 630 });
      const alt = OG_IMAGE_ALT.exec(readFileSync(join(DIST, page), 'utf8'))?.[1] ?? '';
      expect(alt.length, page).toBeGreaterThan(0);
    }
  });

  test('AC9: dist/og holds the site card, 12 month cards and one card per produce page', () => {
    expect(existsSync(join(OG_DIR, 'site.png'))).toBe(true);
    expect(readdirSync(join(OG_DIR, 'sezon')).filter((file) => file.endsWith('.png'))).toHaveLength(
      MONTHS_IN_YEAR,
    );
    for (const section of PRODUCE_SECTIONS) {
      const sectionDir = join(DIST, section);
      if (!existsSync(sectionDir)) continue;
      const pages = readdirSync(sectionDir).filter((file) => file.endsWith('.html'));
      for (const page of pages) {
        const card = join(OG_DIR, section, page.replace('.html', '.png'));
        expect(existsSync(card), card).toBe(true);
      }
    }
  });
});
