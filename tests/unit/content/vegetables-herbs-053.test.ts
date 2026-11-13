import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

const DATA_DIR = join(process.cwd(), 'src', 'data');
const schema = produceSchemaWith({ image: testImage });

type Level = 'peak' | 'available' | 'storage';

interface Added {
  readonly kind: 'vegetable' | 'herb';
  readonly group: string;
  readonly season: Readonly<Record<number, Level>>;
  readonly fdcId?: string;
  readonly photo?: string;
}

/** Builds a season map that gives every listed month the same level. */
const months = (level: Level, ...list: ReadonlyArray<number>): Readonly<Record<number, Level>> =>
  Object.fromEntries(list.map((month) => [month, level]));

/** The produce added by spec 053: kind, group, season (section 5), FDC id and Unsplash photo id. */
const ADDED: Readonly<Record<string, Added>> = {
  grah: {
    kind: 'vegetable',
    group: 'bobovi',
    season: months('peak', 5, 6),
    fdcId: '170419',
    photo: 'K2-ZxFtVXrg',
  },
  bakla: {
    kind: 'vegetable',
    group: 'bobovi',
    season: months('peak', 5),
    fdcId: '170377',
    photo: '2_urXm2lJR4',
  },
  bob: {
    kind: 'vegetable',
    group: 'bobovi',
    season: months('peak', 9, 10),
    fdcId: '175202',
    photo: 'b6h5nTVD1Hw',
  },
  ryapa: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    season: months('peak', 10, 11),
    fdcId: '170465',
    photo: 'f7i3SDvhDik',
  },
  alabash: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    season: {
      ...months('peak', 7),
      ...months('available', 10, 11),
      ...months('storage', 12, 1, 2, 3, 4),
    },
    fdcId: '168424',
    photo: 'tpZOOZLYC28',
  },
  'bryukselsko-zele': {
    kind: 'vegetable',
    group: 'krastotsvetni',
    season: months('available', 9, 10, 11, 12, 1),
    fdcId: '170383',
    photo: 'q6HCBFaL-ZU',
  },
  pashtarnak: {
    kind: 'vegetable',
    group: 'sennikotsvetni',
    season: months('available', 9, 10, 11),
    fdcId: '170417',
    photo: 'Bt-T8tSfBkM',
  },
  hryan: { kind: 'vegetable', group: 'krastotsvetni', season: months('peak', 10) },
  asperzhi: {
    kind: 'vegetable',
    group: 'zaychesyankovi',
    season: months('peak', 4, 5, 6),
    fdcId: '168389',
    photo: 'vZI6sTly1p4',
  },
  reven: {
    kind: 'vegetable',
    group: 'lapadovi',
    season: { ...months('available', 4), ...months('peak', 5, 6, 7) },
    fdcId: '167758',
  },
  artishok: {
    kind: 'vegetable',
    group: 'slozhnotsvetni',
    season: months('peak', 5, 6),
    fdcId: '169205',
    photo: 'J84yENp4O9w',
  },
  rukola: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    season: months('available', 4, 5, 6, 7, 10, 11),
    fdcId: '169387',
  },
  keyl: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    season: months('available', 3, 4, 5, 9, 10, 11),
    fdcId: '168421',
  },
  bosilek: {
    kind: 'herb',
    group: 'ustnotsvetni',
    season: months('available', 7, 8),
    fdcId: '172232',
    photo: '0wWYos3ZGqU',
  },
  menta: {
    kind: 'herb',
    group: 'ustnotsvetni',
    season: { ...months('available', 6), ...months('peak', 7, 8) },
    fdcId: '173474',
    photo: 'dJ4JgX5I5y8',
  },
  dzhodzhen: {
    kind: 'herb',
    group: 'ustnotsvetni',
    season: months('available', 7, 8, 9, 10),
    fdcId: '173475',
  },
  rigan: { kind: 'herb', group: 'ustnotsvetni', season: months('peak', 6, 7, 8) },
  mashterka: {
    kind: 'herb',
    group: 'ustnotsvetni',
    season: months('available', 6, 7, 8),
    fdcId: '173470',
    photo: 'GhoC01t5gT0',
  },
  rozmarin: {
    kind: 'herb',
    group: 'ustnotsvetni',
    season: months('available', 6, 7, 8),
    fdcId: '173473',
    photo: 'Wl-z9lbwkSI',
  },
  salvia: {
    kind: 'herb',
    group: 'ustnotsvetni',
    season: { ...months('peak', 5), ...months('available', 6, 7, 8) },
    photo: 'ZbxEgEaxDew',
  },
  estragon: { kind: 'herb', group: 'slozhnotsvetni', season: months('available', 6, 7, 8) },
};
const SLUGS = Object.keys(ADDED);
const LEFT_OUT = [
  'kopriva',
  'gluharche',
  'lapad',
  'levurda',
  'loboda',
  'chubritsa',
  'devesil',
  'sladak-kartof',
  'sladka-tsarevitsa',
  'cherveno-zele',
];
const NEW_GROUPS = { zaychesyankovi: 'Asparagaceae', ustnotsvetni: 'Lamiaceae' } as const;
const FORBIDDEN = /богат|полез|лекува|действие/i;

const readYaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const produceFile = (slug: string) => join(DATA_DIR, 'produce', `${slug}.yaml`);
const recordOf = (slug: string) => schema.parse(readYaml(produceFile(slug)));
const addedOf = (slug: string): Added => {
  const added = ADDED[slug];
  if (added === undefined) throw new Error(`unknown slug ${slug}`);
  return added;
};

describe('more vegetables and herbs (spec 053)', () => {
  it.each(SLUGS)('AC1: %s exists, is valid and has its kind and group', (slug) => {
    expect(existsSync(produceFile(slug)), slug).toBe(true);
    const record = recordOf(slug);
    expect(record.kind).toBe(addedOf(slug).kind);
    expect(record.group).toBe(addedOf(slug).group);
  });

  it.each(LEFT_OUT)('AC1: %s is left out', (slug) => {
    expect(existsSync(produceFile(slug))).toBe(false);
  });

  it.each(SLUGS)('AC2: %s has the season of the spec table', (slug) => {
    const season = Object.fromEntries(
      recordOf(slug).season.map((entry) => [entry.month, entry.level]),
    );
    expect(season).toEqual(addedOf(slug).season);
  });

  it.each(SLUGS)('AC3: %s cites its USDA record or gives no nutrition', (slug) => {
    const { fdcId } = addedOf(slug);
    const nutrition = recordOf(slug).nutrition;
    if (fdcId === undefined) {
      expect(nutrition).toBeUndefined();
      return;
    }
    expect(nutrition?.source.url).toBe(`https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`);
  });

  it.each(SLUGS)('AC4: %s names no province and cites no gradinata.bg page', (slug) => {
    expect(recordOf(slug).regions).toEqual([]);
    expect(readFileSync(produceFile(slug), 'utf8')).not.toMatch(/gradinata\.bg/i);
  });

  it.each(SLUGS)('AC5: %s has its Unsplash photo or none', (slug) => {
    const { photo } = addedOf(slug);
    const raw = readYaml(produceFile(slug)) as {
      photo?: { src: string; credit: { sourceUrl: string } };
    };
    if (photo === undefined) {
      expect(raw.photo).toBeUndefined();
      return;
    }
    expect(raw.photo?.src).toBe(`../../assets/produce/${slug}.jpg`);
    expect(existsSync(join(process.cwd(), 'src', 'assets', 'produce', `${slug}.jpg`))).toBe(true);
    expect(raw.photo?.credit.sourceUrl).toMatch(
      new RegExp(`^https://unsplash\\.com/photos/.*${photo}$`),
    );
  });

  it.each(SLUGS)('AC6: %s makes no health claim and has no uses or organic block', (slug) => {
    const record = recordOf(slug);
    for (const text of [record.summary, record.photo?.alt ?? '']) {
      expect(text, slug).not.toMatch(FORBIDDEN);
    }
    expect(record.traditionalUses).toEqual([]);
    expect(record.organic).toBeUndefined();
  });

  it.each(Object.entries(NEW_GROUPS))('AC7: group %s is %s', (id, latinName) => {
    const group = readYaml(join(DATA_DIR, 'groups', `${id}.yaml`)) as { latinName: string };
    expect(group.latinName).toBe(latinName);
  });

  it('AC8: the checklist has a row per new produce', () => {
    const lines = readFileSync('docs/content-review/README.md', 'utf8').split('\n');
    for (const slug of SLUGS) {
      expect(
        lines.some((line) => line.startsWith(`| \`${slug}\``)),
        slug,
      ).toBe(true);
    }
  });
});
