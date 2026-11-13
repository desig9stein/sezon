import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

const DATA_DIR = join(process.cwd(), 'src', 'data');
const PHOTO_DIR = join(process.cwd(), 'src', 'assets', 'produce');
const schema = produceSchemaWith({ image: testImage });

type Level = 'peak' | 'available' | 'storage';

interface Added {
  readonly kind: 'fruit' | 'vegetable' | 'herb' | 'nut';
  readonly group: string;
  readonly latinName: string;
  readonly season: Readonly<Record<number, Level>>;
  readonly fdc?: { readonly id: string; readonly description: string };
  readonly photo?: string;
  readonly storage?: boolean;
}

/** Builds a season map that gives every listed month the same level. */
const months = (level: Level, ...list: ReadonlyArray<number>): Readonly<Record<number, Level>> =>
  Object.fromEntries(list.map((month) => [month, level]));

/** The produce added by spec 056 (sections 3 and 5). */
const ADDED: Readonly<Record<string, Added>> = {
  'zemna-yabalka': {
    kind: 'vegetable',
    group: 'slozhnotsvetni',
    latinName: 'Helianthus tuberosus',
    season: { ...months('peak', 10, 11), ...months('available', 12, 1, 2) },
    fdc: { id: '169236', description: 'Jerusalem-artichokes, raw' },
    photo: 'wsJJ-tSct2g',
  },
  endivia: {
    kind: 'vegetable',
    group: 'slozhnotsvetni',
    latinName: 'Cichorium endivia',
    season: months('peak', 6, 7, 10, 11, 12),
    fdc: { id: '168412', description: 'Endive, raw' },
  },
  shamfastak: {
    kind: 'nut',
    group: 'smradlikovi',
    latinName: 'Pistacia vera',
    season: months('peak', 9),
    fdc: { id: '170184', description: 'Nuts, pistachio nuts, raw' },
    photo: 'ES9YQ5HAwPI',
  },
  chernitsi: {
    kind: 'fruit',
    group: 'chernichevi',
    latinName: 'Morus',
    season: months('peak', 6, 7, 8),
    fdc: { id: '169913', description: 'Mulberries, raw' },
    photo: 'oXWN5kByryQ',
    storage: true,
  },
  matochina: {
    kind: 'herb',
    group: 'ustnotsvetni',
    latinName: 'Melissa officinalis',
    season: { ...months('peak', 5, 6, 8), ...months('available', 7, 9) },
    photo: 'whTrv7kvGJY',
  },
  kreson: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    latinName: 'Lepidium sativum',
    season: months('available', 3, 4, 5, 6, 8, 9),
    fdc: { id: '168407', description: 'Cress, garden, raw' },
  },
  'kitaysko-zele': {
    kind: 'vegetable',
    group: 'krastotsvetni',
    latinName: 'Brassica rapa subsp. pekinensis',
    season: months('peak', 10, 11),
    fdc: { id: '169979', description: 'Cabbage, chinese (pe-tsai), raw' },
    photo: 'BCXgdJJ5nPY',
  },
  'yaponska-dyulya': {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Chaenomeles japonica',
    season: { ...months('peak', 9, 10), ...months('storage', 11, 12, 1, 2) },
    storage: true,
  },
  nahut: {
    kind: 'vegetable',
    group: 'bobovi',
    latinName: 'Cicer arietinum',
    season: months('available', 7),
    fdc: {
      id: '173756',
      description: 'Chickpeas (garbanzo beans, bengal gram), mature seeds, raw',
    },
    photo: '5352eOUYay4',
  },
  'sladak-kartof': {
    kind: 'vegetable',
    group: 'povetitsovi',
    latinName: 'Ipomoea batatas',
    season: months('peak', 9, 10),
    fdc: { id: '168482', description: 'Sweet potato, raw, unprepared' },
    photo: 'k0MigzUz-vI',
  },
};
const SLUGS = Object.keys(ADDED);
const LEFT_OUT = [
  'godzhi-beri',
  'kamchatska-borovinka',
  'fizalis',
  'shafran',
  'kervel',
  'momordika',
  'irga',
  'tuchenitsa',
  'ayzberg',
  'shalot',
  'zelen-chesan',
  'cherna-ryapa',
  'patison',
  'magdanozen-koren',
  'tsarigradsko-grozde',
  'radikio',
  'koriandar',
  'rezene',
  'mangold',
  'mayorana',
  'leshta',
  'brukva',
  'polska-salata',
];
const NEW_GROUPS = { smradlikovi: 'Anacardiaceae', povetitsovi: 'Convolvulaceae' } as const;
const FORBIDDEN = /богат|полез|лекува|действие/i;
const SUMMARY_MIN = 70;
const SUMMARY_MAX = 160;
const PHOTO_WIDTH = 1600;
const PHOTO_HEIGHT = 1200;

const readYaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const produceFile = (slug: string) => join(DATA_DIR, 'produce', `${slug}.yaml`);
const recordOf = (slug: string) => schema.parse(readYaml(produceFile(slug)));
const addedOf = (slug: string): Added => {
  const added = ADDED[slug];
  if (added === undefined) throw new Error(`unknown slug ${slug}`);
  return added;
};

/** Reads the pixel size of a baseline or progressive JPEG from its SOF marker. */
const jpegSize = (path: string): { width: number; height: number } => {
  const bytes = readFileSync(path);
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes.readUInt16BE(offset);
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xffc0 && marker <= 0xffc2) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`no SOF marker in ${path}`);
};

describe('more cultivated produce (spec 056)', () => {
  it.each(SLUGS)('AC1: %s exists, is valid and has its kind, group and Latin name', (slug) => {
    expect(existsSync(produceFile(slug)), slug).toBe(true);
    const record = recordOf(slug);
    const added = addedOf(slug);
    expect(record.kind).toBe(added.kind);
    expect(record.group).toBe(added.group);
    expect(record.latinName).toBe(added.latinName);
  });

  it.each(SLUGS)('AC2: %s has the season of the spec table', (slug) => {
    const season = Object.fromEntries(
      recordOf(slug).season.map((entry) => [entry.month, entry.level]),
    );
    expect(season).toEqual(addedOf(slug).season);
  });

  it.each(SLUGS)('AC3: %s cites its USDA record or gives no nutrition', (slug) => {
    const { fdc } = addedOf(slug);
    const nutrition = recordOf(slug).nutrition;
    if (fdc === undefined) {
      expect(nutrition).toBeUndefined();
      return;
    }
    expect(nutrition?.source.url).toBe(`https://fdc.nal.usda.gov/food-details/${fdc.id}/nutrients`);
    expect(nutrition?.source.name).toBe(`USDA FoodData Central, SR Legacy: ${fdc.description}`);
  });

  it.each(SLUGS)('AC4: %s names no province and cites no gradinata.bg page', (slug) => {
    expect(recordOf(slug).regions).toEqual([]);
    expect(readFileSync(produceFile(slug), 'utf8')).not.toMatch(/gradinata\.bg/i);
  });

  it.each(SLUGS)('AC5: %s has its Unsplash photo or none', (slug) => {
    const { photo } = addedOf(slug);
    const raw = readYaml(produceFile(slug)) as {
      photo?: { src: string; credit: { sourceUrl: string; sourceName: string } };
    };
    if (photo === undefined) {
      expect(raw.photo).toBeUndefined();
      return;
    }
    const file = join(PHOTO_DIR, `${slug}.jpg`);
    expect(raw.photo?.src).toBe(`../../assets/produce/${slug}.jpg`);
    expect(existsSync(file)).toBe(true);
    expect(jpegSize(file)).toEqual({ width: PHOTO_WIDTH, height: PHOTO_HEIGHT });
    expect(raw.photo?.credit.sourceName).toBe('Unsplash');
    expect(raw.photo?.credit.sourceUrl).toMatch(
      new RegExp(`^https://unsplash\\.com/photos/.*${photo}$`),
    );
  });

  it.each(SLUGS)('AC6: %s makes no health claim and has a valid summary', (slug) => {
    const record = recordOf(slug);
    for (const text of [record.summary, record.storage ?? '', record.photo?.alt ?? '']) {
      expect(text, slug).not.toMatch(FORBIDDEN);
    }
    expect(record.summary.length).toBeGreaterThanOrEqual(SUMMARY_MIN);
    expect(record.summary.length).toBeLessThanOrEqual(SUMMARY_MAX);
    expect(record.traditionalUses).toEqual([]);
    expect(record.organic).toBeUndefined();
    expect(readFileSync(produceFile(slug), 'utf8')).toMatch(/^updatedAt: 2026-11-13$/m);
  });

  it.each(LEFT_OUT)('AC7: %s is left out', (slug) => {
    expect(existsSync(produceFile(slug))).toBe(false);
  });

  it.each(Object.entries(NEW_GROUPS))('AC8: group %s is %s', (id, latinName) => {
    const file = join(DATA_DIR, 'groups', `${id}.yaml`);
    expect(existsSync(file), id).toBe(true);
    expect((readYaml(file) as { latinName: string }).latinName).toBe(latinName);
  });

  it('AC9: the checklist has a row per new produce and the content guide names spec 056', () => {
    const lines = readFileSync('docs/content-review/README.md', 'utf8').split('\n');
    for (const slug of SLUGS) {
      expect(
        lines.some((line) => line.startsWith(`| \`${slug}\``)),
        slug,
      ).toBe(true);
    }
    expect(readFileSync('docs/CONTENT-GUIDE.md', 'utf8')).toMatch(/spec 056/);
  });

  it.each(SLUGS)('AC10: %s has a storage text only where the spec gives one', (slug) => {
    const { storage } = addedOf(slug);
    const text = recordOf(slug).storage;
    if (storage === true) {
      expect(text?.length ?? 0).toBeGreaterThan(0);
      return;
    }
    expect(text).toBeUndefined();
  });
});
