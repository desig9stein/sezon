import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

interface Source {
  readonly name: string;
  readonly url: string;
}

interface ProduceFile {
  readonly kind: string;
  readonly group: string;
  readonly latinName?: string;
  readonly varieties?: ReadonlyArray<{ readonly name: string }>;
  readonly season: ReadonlyArray<{ readonly month: number; readonly level: string }>;
  readonly regions?: ReadonlyArray<{
    readonly region: string;
    readonly note: string;
    readonly source?: Source;
  }>;
  readonly nutrition?: { readonly source: Source };
  readonly traditionalUses?: ReadonlyArray<unknown>;
  readonly updatedAt: string | Date;
  readonly photo?: {
    readonly src: string;
    readonly credit: {
      readonly author: string;
      readonly authorUrl: string;
      readonly sourceName: string;
      readonly sourceUrl: string;
    };
  };
}

interface Expected {
  readonly kind: 'fruit' | 'nut';
  readonly group: string;
  readonly latinName?: string;
  /** Season as `month:level` pairs, level P = peak, A = available, S = storage (spec 052). */
  readonly season: string;
  readonly fdcId?: string;
  readonly description?: string;
  readonly varieties?: ReadonlyArray<string>;
}

const DATA_DIR = join(process.cwd(), 'src', 'data');
const PRODUCE_DIR = join(DATA_DIR, 'produce');
const MZH_HOST = 'www.mzh.government.bg';
const BULLETIN_448 = 'бюлетин № 448';
const EDITION_2025 = 'реколта 2025';
const BANNED_HOST = 'gradinata.bg';
const CHANGE_DATE = '2026-11-13';
const LEVELS: Readonly<Record<string, string>> = { P: 'peak', A: 'available', S: 'storage' };
/** The South Central provinces the site names for NUTS2 data, as for cabbage (spec 041). */
const SOUTH_CENTRAL = ['plovdiv', 'pazardzhik'];

/** Expected data of each new produce (spec 052, section 5). */
const EXPECTED: Readonly<Record<string, Expected>> = {
  vishni: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Prunus cerasus',
    season: '6:P 7:A',
    fdcId: '173954',
    description: 'Cherries, sour, red, raw',
    varieties: [
      'Хайманов рубин',
      'Фанал',
      'Облачанска вишна',
      'Монтморенси',
      'Сенчеста морела',
      'Метеор',
    ],
  },
  malini: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Rubus idaeus',
    season: '6:A 7:A 8:A 9:P 10:A',
    fdcId: '167755',
    description: 'Raspberries, raw',
    varieties: ['Люлин', 'Херитидж'],
  },
  kapini: {
    kind: 'fruit',
    group: 'rozotsvetni',
    season: '7:A 8:P 9:P 10:A',
    fdcId: '173946',
    description: 'Blackberries, raw',
    varieties: ['Торнфрий'],
  },
  borovinki: {
    kind: 'fruit',
    group: 'pirenovi',
    latinName: 'Vaccinium corymbosum',
    season: '6:P 7:P 8:P 9:P',
    fdcId: '171711',
    description: 'Blueberries, raw',
  },
  kasis: { kind: 'fruit', group: 'kasisovi', latinName: 'Ribes nigrum', season: '6:P 7:P' },
  dini: {
    kind: 'fruit',
    group: 'tikvovi',
    latinName: 'Citrullus lanatus',
    season: '6:A 7:P 8:A',
    fdcId: '167765',
    description: 'Watermelon, raw',
  },
  nektarini: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Prunus persica var. nucipersica',
    season: '8:P',
    fdcId: '169914',
    description: 'Nectarines, raw',
    varieties: ['Индипендънс', 'Фантазия'],
  },
  mushmuli: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Mespilus germanica',
    season: '10:A 11:P',
  },
  nar: {
    kind: 'fruit',
    group: 'blatievi',
    latinName: 'Punica granatum',
    season: '10:P 11:S 12:S',
    fdcId: '169134',
    description: 'Pomegranates, raw',
  },
  'rayska-yabalka': {
    kind: 'fruit',
    group: 'abanosovi',
    latinName: 'Diospyros kaki',
    season: '10:P 11:A',
    fdcId: '169941',
    description: 'Persimmons, japanese, raw',
  },
  kivi: {
    kind: 'fruit',
    group: 'aktinidievi',
    latinName: 'Actinidia deliciosa',
    season: '10:A 11:P 12:S',
    fdcId: '168153',
    description: 'Kiwifruit, green, raw',
    varieties: ['Хейуърд', 'Абот', 'Бруно', 'Монти'],
  },
  shipka: { kind: 'fruit', group: 'rozotsvetni', latinName: 'Rosa canina', season: '9:P 10:A' },
  drenki: { kind: 'fruit', group: 'dryanovi', latinName: 'Cornus mas', season: '8:P 9:P 10:P' },
  aronia: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Aronia melanocarpa',
    season: '8:P 9:A',
  },
  dzhanki: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Prunus cerasifera',
    season: '6:P 7:P 8:P 9:P',
  },
  oblepiha: {
    kind: 'fruit',
    group: 'mirizlivovarbovi',
    latinName: 'Hippophae rhamnoides',
    season: '7:A 8:P 9:P 10:A',
  },
  skorusha: {
    kind: 'fruit',
    group: 'rozotsvetni',
    latinName: 'Sorbus domestica',
    season: '8:A 9:P 10:A 11:S 12:S',
  },
  hinap: { kind: 'fruit', group: 'zarnikovi', latinName: 'Ziziphus jujuba', season: '9:A 10:P' },
  leshnitsi: {
    kind: 'nut',
    group: 'brezovi',
    latinName: 'Corylus avellana',
    season: '8:P',
    fdcId: '170581',
    description: 'Nuts, hazelnuts or filberts',
    varieties: [
      'Бадемовиден',
      'Ран трапезундски',
      'Тонда джентиле',
      'Тракийски',
      'Римски',
      'Ата баба',
      'Халски',
    ],
  },
  bademi: {
    kind: 'nut',
    group: 'rozotsvetni',
    latinName: 'Prunus dulcis',
    season: '8:A 9:P 10:A',
    fdcId: '170567',
    description: 'Nuts, almonds',
    varieties: ['Ароматичен', 'Аспарух', 'Марково', 'Никитски', 'Нонпарел', 'Поморие'],
  },
  fastatsi: {
    kind: 'nut',
    group: 'bobovi',
    latinName: 'Arachis hypogaea',
    season: '9:P',
    fdcId: '172430',
    description: 'Peanuts, all types, raw',
  },
};

/** The nine new botanical groups and their Latin family names (spec 052, section 3). */
const NEW_GROUPS: Readonly<Record<string, readonly [string, string]>> = {
  pirenovi: ['Пиренови', 'Ericaceae'],
  kasisovi: ['Касисови', 'Grossulariaceae'],
  blatievi: ['Блатиеви', 'Lythraceae'],
  abanosovi: ['Абаносови', 'Ebenaceae'],
  aktinidievi: ['Актинидиеви', 'Actinidiaceae'],
  dryanovi: ['Дрянови', 'Cornaceae'],
  mirizlivovarbovi: ['Миризливовърбови', 'Elaeagnaceae'],
  zarnikovi: ['Зърникови', 'Rhamnaceae'],
  brezovi: ['Брезови', 'Betulaceae'],
};

/** Province rankings from МЗХ bulletin № 448, Table 2, with the area in hectares. */
const RANKED_REGIONS: Readonly<Record<string, ReadonlyArray<readonly [string, string]>>> = {
  vishni: [
    ['targovishte', '196'],
    ['sofiyska', '180'],
    ['plovdiv', '175'],
  ],
  malini: [
    ['targovishte', '374'],
    ['razgrad', '210'],
    ['sofiyska', '195'],
  ],
  leshnitsi: [
    ['varna', '433'],
    ['ruse', '340'],
    ['burgas', '235'],
  ],
  bademi: [
    ['burgas', '888'],
    ['haskovo', '802'],
    ['sliven', '326'],
  ],
  nektarini: [
    ['sliven', '1 475'],
    ['burgas', '398'],
    ['ruse', '218'],
  ],
};

/** NUTS2 entries: the South Central region and its 2025 figure (spec 052, section 5). */
const NUTS2_REGIONS: Readonly<Record<string, string>> = {
  dini: '4 092 от 8 669 ха',
  shipka: '323 от 950 ха',
};

const SLUGS = Object.keys(EXPECTED);
const WITHOUT_REGIONS = SLUGS.filter(
  (slug) => RANKED_REGIONS[slug] === undefined && NUTS2_REGIONS[slug] === undefined,
);

const pathOf = (slug: string) => join(PRODUCE_DIR, `${slug}.yaml`);
const read = (slug: string): ProduceFile =>
  parse(readFileSync(pathOf(slug), 'utf8')) as ProduceFile;
const hostOf = (url: string) => new URL(url).hostname;
const expectedOf = (slug: string): Expected => {
  const expected = EXPECTED[slug];
  if (expected === undefined) throw new Error(`No expectation for ${slug}`);
  return expected;
};
const seasonOf = (text: string) =>
  text.split(' ').map((pair) => {
    const [month, level] = pair.split(':');
    return { month: Number(month), level: LEVELS[level ?? ''] };
  });
const schema = produceSchemaWith({ image: testImage });

describe('more fruits and nuts (spec 052)', () => {
  it.each(SLUGS)('AC1: %s exists, is valid and has its kind, group and Latin name', (slug) => {
    expect(existsSync(pathOf(slug)), slug).toBe(true);
    const raw: unknown = parse(readFileSync(pathOf(slug), 'utf8'));
    expect(schema.safeParse(raw).success, slug).toBe(true);
    const produce = read(slug);
    const expected = expectedOf(slug);
    expect(produce.kind).toBe(expected.kind);
    expect(produce.group).toBe(expected.group);
    expect(produce.latinName).toBe(expected.latinName);
  });

  it.each(Object.keys(NEW_GROUPS))('AC1: the group %s exists with its family name', (id) => {
    const path = join(DATA_DIR, 'groups', `${id}.yaml`);
    expect(existsSync(path), id).toBe(true);
    const [name, latinName] = NEW_GROUPS[id] ?? ['', ''];
    expect(parse(readFileSync(path, 'utf8'))).toMatchObject({ name, latinName });
  });

  it.each(SLUGS)('AC2: %s has the season of the spec table', (slug) => {
    const season = [...read(slug).season].sort((a, b) => a.month - b.month);
    expect(season).toEqual(seasonOf(expectedOf(slug).season));
  });

  it.each(SLUGS)('AC3: %s cites its SR Legacy record, or has no nutrition', (slug) => {
    const { fdcId, description } = expectedOf(slug);
    const { nutrition } = read(slug);
    if (fdcId === undefined) {
      expect(nutrition, slug).toBeUndefined();
      return;
    }
    expect(nutrition?.source.url).toBe(`https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`);
    expect(nutrition?.source.name).toBe(`USDA FoodData Central, SR Legacy: ${description}`);
  });

  it.each(Object.keys(RANKED_REGIONS))(
    'AC4: %s names the three leading provinces of the МЗХ orchard survey',
    (slug) => {
      const regions = read(slug).regions ?? [];
      const expected = RANKED_REGIONS[slug] ?? [];
      expect(regions.map((entry) => entry.region)).toEqual(expected.map(([region]) => region));
      regions.forEach((entry, index) => {
        const where = `${slug}/${entry.region}`;
        expect(hostOf(entry.source?.url ?? 'https://invalid'), where).toBe(MZH_HOST);
        expect(entry.source?.name, where).toContain(BULLETIN_448);
        expect(entry.note, where).toContain(`${expected[index]?.[1] ?? ''} ха`);
        expect(entry.note, where).toContain('2023');
        if (slug === 'nektarini') expect(entry.note, where).toContain('праскови и нектарини');
      });
    },
  );

  it.each(Object.keys(NUTS2_REGIONS))(
    'AC5: %s names Plovdiv and Pazardzhik for the South Central region',
    (slug) => {
      const regions = read(slug).regions ?? [];
      expect(regions.map((entry) => entry.region)).toEqual(SOUTH_CENTRAL);
      for (const entry of regions) {
        const where = `${slug}/${entry.region}`;
        expect(hostOf(entry.source?.url ?? 'https://invalid'), where).toBe(MZH_HOST);
        expect(entry.source?.name, where).toContain(EDITION_2025);
        expect(entry.note, where).toContain('Южния централен район');
        expect(entry.note, where).toContain(NUTS2_REGIONS[slug]);
        expect(entry.note, where).toContain('2025');
      }
    },
  );

  it.each(WITHOUT_REGIONS)('AC6: %s has no regions (no official data)', (slug) => {
    expect(read(slug).regions ?? []).toEqual([]);
  });

  it.each(SLUGS)('AC7: %s has no banned host, no traditional uses, no „богат“', (slug) => {
    const text = readFileSync(pathOf(slug), 'utf8');
    expect(text).not.toContain(BANNED_HOST);
    expect(text.toLowerCase()).not.toContain('богат');
    const produce = read(slug);
    expect(produce.traditionalUses ?? []).toEqual([]);
    const updatedAt =
      produce.updatedAt instanceof Date
        ? produce.updatedAt.toISOString().slice(0, 10)
        : produce.updatedAt;
    expect(updatedAt).toBe(CHANGE_DATE);
  });

  it.each(SLUGS)('AC8: %s has an existing Unsplash photo when it has one', (slug) => {
    const { photo } = read(slug);
    if (photo === undefined) return;
    expect(photo.credit.author.length).toBeGreaterThan(0);
    expect(hostOf(photo.credit.authorUrl)).toBe('unsplash.com');
    expect(photo.credit.sourceName).toBe('Unsplash');
    expect(photo.credit.sourceUrl).toMatch(/^https:\/\/unsplash\.com\/photos\//);
    expect(existsSync(resolve(dirname(pathOf(slug)), photo.src))).toBe(true);
  });

  it.each(SLUGS)('AC9: %s lists exactly the verified varieties', (slug) => {
    const names = (read(slug).varieties ?? []).map((variety) => variety.name);
    expect(names).toEqual(expectedOf(slug).varieties ?? []);
  });

  it.each(['cherveno-frensko-grozde', 'gorski-yagodi', 'baz'])(
    'AC10: %s is left out (no season source, or unsafe)',
    (slug) => {
      expect(existsSync(pathOf(slug))).toBe(false);
    },
  );

  it('AC11: the checklist and the content guide record the new produce', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const slug of SLUGS) {
      const row = checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``));
      expect(row, slug).toBeDefined();
      const { fdcId } = expectedOf(slug);
      if (fdcId !== undefined) expect(row, slug).toContain(fdcId);
    }
    const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
    expect(guide.slice(guide.indexOf('## Seed data status'))).toContain('spec 052');
  });
});
