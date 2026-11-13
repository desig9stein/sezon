import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

interface Source {
  readonly name: string;
  readonly url: string;
}

interface SummerFruit {
  readonly kind: string;
  readonly group: string;
  readonly regions: ReadonlyArray<{
    readonly region: string;
    readonly note: string;
    readonly source?: Source;
  }>;
  readonly nutrition: { readonly source: Source };
  readonly traditionalUses: ReadonlyArray<unknown>;
  readonly photo?: {
    readonly src: string;
    readonly credit: { readonly author: string; readonly sourceUrl: string };
  };
  readonly growing?: { readonly sources: ReadonlyArray<Source> };
}

const PRODUCE_DIR = join(process.cwd(), 'src', 'data', 'produce');
const ASSETS_DIR = join(process.cwd(), 'src', 'assets', 'produce');
const GROUPS_DIR = join(process.cwd(), 'src', 'data', 'groups');
const MZH_HOST = 'www.mzh.government.bg';
const ORCHARD_TITLE = 'Структура на основни овощни видове в България през 2023';
const VEGETABLES_TITLE = 'Производство на зеленчуци, реколта 2022';
const PHOTO_SIZE = { width: 1600, height: 1200 };
/** JPEG start-of-frame markers (baseline, extended, progressive) that carry the image size. */
const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2]);

/** Returns the pixel size of a JPEG file from its start-of-frame segment. */
const jpegSize = (file: string): { width: number; height: number } | undefined => {
  const bytes = readFileSync(file);
  let offset = 2;
  while (offset + 9 < bytes.length) {
    const marker = bytes[offset + 1] ?? 0;
    const length = bytes.readUInt16BE(offset + 2);
    if (SOF_MARKERS.has(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return undefined;
};

/** The eight fruits of issue #38 with their group and USDA FDC record (spec 040). */
const FRUITS: Readonly<Record<string, { readonly group: string; readonly fdcId: string }>> = {
  yagodi: { group: 'rozotsvetni', fdcId: '167762' },
  chereshi: { group: 'rozotsvetni', fdcId: '171719' },
  kaysii: { group: 'rozotsvetni', fdcId: '171697' },
  praskovi: { group: 'rozotsvetni', fdcId: '169928' },
  slivi: { group: 'rozotsvetni', fdcId: '169949' },
  grozde: { group: 'lozovi', fdcId: '174683' },
  smokini: { group: 'chernichevi', fdcId: '173021' },
  papeshi: { group: 'tikvovi', fdcId: '169911' },
};
const SLUGS = Object.keys(FRUITS);

/** Provinces leading the МЗХ orchard survey 2023, in the order of the data. */
const ORCHARD_REGIONS: Readonly<Record<string, ReadonlyArray<string>>> = {
  chereshi: ['burgas', 'kyustendil', 'plovdiv'],
  kaysii: ['silistra', 'ruse', 'dobrich'],
  praskovi: ['sliven', 'burgas', 'ruse'],
  slivi: ['plovdiv', 'lovech', 'silistra'],
  grozde: ['plovdiv', 'burgas', 'haskovo'],
};
const NUTS2_PRODUCE = ['yagodi', 'papeshi'] as const;
const NUTS2_REGIONS = ['plovdiv', 'pazardzhik'];
const FIG_REGIONS = ['blagoevgrad', 'haskovo'];
const GROWING_HOSTS = new Set(['www.bgfermer.bg', 'agrozona.bg']);

const exists = (slug: string) => existsSync(join(PRODUCE_DIR, `${slug}.yaml`));
const raw = (slug: string) => readFileSync(join(PRODUCE_DIR, `${slug}.yaml`), 'utf8');
const fruit = (slug: string) => parse(raw(slug)) as SummerFruit;
const hostOf = (url: string | undefined) => new URL(url ?? 'https://invalid').hostname;
const schema = produceSchemaWith({ image: testImage });

describe('summer fruits (spec 040)', () => {
  it.each(SLUGS)('AC1: %s exists, parses and has its kind and group', (slug) => {
    expect(exists(slug), `${slug}.yaml`).toBe(true);
    if (!exists(slug)) return;
    expect(schema.safeParse(parse(raw(slug))).success).toBe(true);
    expect(fruit(slug).kind).toBe('fruit');
    expect(fruit(slug).group).toBe(FRUITS[slug]?.group);
  });

  it.each(SLUGS)('AC2: %s cites its USDA SR Legacy record', (slug) => {
    expect(exists(slug)).toBe(true);
    if (!exists(slug)) return;
    expect(fruit(slug).nutrition.source.url).toBe(
      `https://fdc.nal.usda.gov/food-details/${FRUITS[slug]?.fdcId}/nutrients`,
    );
  });

  it.each(Object.entries(ORCHARD_REGIONS))(
    'AC3: %s lists the leading provinces of МЗХ bulletin № 448',
    (slug, expected) => {
      expect(exists(slug)).toBe(true);
      if (!exists(slug)) return;
      const regions = fruit(slug).regions;
      expect(regions.map((entry) => entry.region)).toEqual(expected);
      for (const entry of regions) {
        expect(hostOf(entry.source?.url), entry.region).toBe(MZH_HOST);
        expect(entry.source?.name, entry.region).toContain(ORCHARD_TITLE);
        expect(entry.note, entry.region).toMatch(/ха към 2023 г\.$/);
      }
    },
  );

  it.each(NUTS2_PRODUCE)('AC4: %s names South Central provinces at NUTS2 level', (slug) => {
    expect(exists(slug)).toBe(true);
    if (!exists(slug)) return;
    const regions = fruit(slug).regions;
    expect(regions.map((entry) => entry.region)).toEqual(NUTS2_REGIONS);
    for (const entry of regions) {
      expect(hostOf(entry.source?.url)).toBe(MZH_HOST);
      expect(entry.source?.name).toContain(VEGETABLES_TITLE);
      expect(entry.note).toContain('Южния централен район');
    }
  });

  it.each(SLUGS)('AC5: %s cites МЗХ for every region note with a figure', (slug) => {
    expect(exists(slug)).toBe(true);
    if (!exists(slug)) return;
    for (const entry of fruit(slug).regions) {
      expect(entry.note, entry.region).not.toMatch(/^Също/);
      if (/\d/.test(entry.note)) expect(hostOf(entry.source?.url), entry.region).toBe(MZH_HOST);
      expect(entry.note, `${entry.region}: thousands separator`).not.toMatch(/\d[ ,.]\d{3}(?!\d)/);
    }
  });

  it('AC6: figs name the areas Agrozona quotes, without figures', () => {
    expect(exists('smokini')).toBe(true);
    if (!exists('smokini')) return;
    const regions = fruit('smokini').regions;
    expect(regions.map((entry) => entry.region)).toEqual(FIG_REGIONS);
    for (const entry of regions) {
      expect(entry.note).not.toMatch(/\d/);
      expect(hostOf(entry.source?.url)).toBe('agrozona.bg');
    }
  });

  it.each(SLUGS)('AC7: %s has a 1600 × 1200 photo credited to Unsplash', (slug) => {
    expect(exists(slug)).toBe(true);
    if (!exists(slug)) return;
    const photo = fruit(slug).photo;
    expect(photo?.src).toBe(`../../assets/produce/${slug}.jpg`);
    expect(photo?.credit.author.length ?? 0).toBeGreaterThan(0);
    expect(hostOf(photo?.credit.sourceUrl)).toBe('unsplash.com');
    const file = join(ASSETS_DIR, `${slug}.jpg`);
    expect(existsSync(file)).toBe(true);
    if (!existsSync(file)) return;
    expect(jpegSize(file)).toEqual(PHOTO_SIZE);
  });

  it.each(SLUGS)('AC8: %s has no traditional uses and no „богат на“', (slug) => {
    expect(exists(slug)).toBe(true);
    if (!exists(slug)) return;
    expect(fruit(slug).traditionalUses).toEqual([]);
    expect(raw(slug).toLowerCase()).not.toMatch(/богат[аио]? на/);
  });

  it.each(SLUGS)('AC9: %s has a growing guide sourced only from Bulgarian farm media', (slug) => {
    expect(exists(slug)).toBe(true);
    if (!exists(slug)) return;
    const growing = fruit(slug).growing;
    expect(growing, slug).toBeDefined();
    for (const source of growing?.sources ?? []) {
      expect(GROWING_HOSTS.has(hostOf(source.url)), source.url).toBe(true);
    }
  });

  it('AC10: the checklist has a row with the FDC id for every new produce', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const slug of SLUGS) {
      const row = checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '';
      expect(row, slug).toContain(`FDC [${FRUITS[slug]?.fdcId}]`);
    }
  });

  it.each([
    ['lozovi', 'Vitaceae'],
    ['chernichevi', 'Moraceae'],
  ])('AC11: the group %s (%s) exists', (slug, latinName) => {
    const file = join(GROUPS_DIR, `${slug}.yaml`);
    expect(existsSync(file)).toBe(true);
    if (!existsSync(file)) return;
    expect((parse(readFileSync(file, 'utf8')) as { latinName: string }).latinName).toBe(latinName);
  });
});
