import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

const DATA_DIR = join(process.cwd(), 'src', 'data');
const schema = produceSchemaWith({ image: testImage });

type Level = 'peak' | 'available' | 'storage';
type Kind = 'look-alike' | 'toxic-part' | 'allergy' | 'protected' | 'preparation';

interface Added {
  readonly name: string;
  readonly latinName: string;
  readonly kind: 'fruit' | 'vegetable';
  readonly group: string;
  readonly wild: boolean;
  readonly season: Readonly<Record<number, Level>>;
  readonly cautions: ReadonlyArray<Kind>;
  readonly fdcId?: string;
  readonly photo?: string;
}

/** Builds a season map that gives every listed month the same level. */
const months = (level: Level, ...list: ReadonlyArray<number>): Readonly<Record<number, Level>> =>
  Object.fromEntries(list.map((month) => [month, level]));

/** The produce added by spec 057 (section 3 and section 5). */
const ADDED: Readonly<Record<string, Added>> = {
  kopriva: {
    name: 'Коприва',
    latinName: 'Urtica dioica',
    kind: 'vegetable',
    group: 'koprivovi',
    wild: true,
    season: months('peak', 5, 6, 7),
    cautions: ['preparation', 'allergy'],
    photo: 'yaKZ4f0tZ4Y',
  },
  gluharche: {
    name: 'Глухарче',
    latinName: 'Taraxacum officinale',
    kind: 'vegetable',
    group: 'slozhnotsvetni',
    wild: true,
    season: months('available', 3, 4),
    cautions: ['protected'],
    fdcId: '169226',
    photo: 'f-02pTFLV14',
  },
  levurda: {
    name: 'Левурда',
    latinName: 'Allium ursinum',
    kind: 'vegetable',
    group: 'amarilisovi',
    wild: true,
    season: months('available', 3, 4),
    cautions: ['look-alike', 'look-alike', 'look-alike', 'look-alike', 'protected'],
  },
  'cheren-baz': {
    name: 'Черен бъз',
    latinName: 'Sambucus nigra',
    kind: 'fruit',
    group: 'meshkovitsovi',
    wild: true,
    season: months('peak', 8),
    cautions: ['toxic-part', 'toxic-part', 'preparation', 'look-alike', 'protected', 'protected'],
    fdcId: '171727',
    photo: 'ITFBAchRAiI',
  },
  glog: {
    name: 'Глог',
    latinName: 'Crataegus monogyna',
    kind: 'fruit',
    group: 'rozotsvetni',
    wild: true,
    season: { ...months('peak', 9), ...months('available', 10) },
    cautions: ['protected', 'protected'],
  },
  tranka: {
    name: 'Трънка',
    latinName: 'Prunus spinosa',
    kind: 'fruit',
    group: 'rozotsvetni',
    wild: true,
    season: months('peak', 9, 10, 11),
    cautions: ['protected'],
  },
  'gorska-yagoda': {
    name: 'Горска ягода',
    latinName: 'Fragaria vesca',
    kind: 'fruit',
    group: 'rozotsvetni',
    wild: true,
    season: months('peak', 6, 7, 8, 9),
    cautions: ['protected'],
  },
  'cherna-borovinka': {
    name: 'Черна боровинка',
    latinName: 'Vaccinium myrtillus',
    kind: 'fruit',
    group: 'pirenovi',
    wild: true,
    season: months('peak', 8),
    cautions: ['protected', 'protected'],
  },
  'chervena-borovinka': {
    name: 'Червена боровинка',
    latinName: 'Vaccinium vitis-idaea',
    kind: 'fruit',
    group: 'pirenovi',
    wild: true,
    season: months('peak', 8),
    cautions: ['protected'],
  },
  ofika: {
    name: 'Офика',
    latinName: 'Sorbus aucuparia',
    kind: 'fruit',
    group: 'rozotsvetni',
    wild: true,
    season: { ...months('peak', 9), ...months('available', 10, 11) },
    cautions: ['toxic-part', 'protected'],
  },
  'kisel-tran': {
    name: 'Кисел трън',
    latinName: 'Berberis vulgaris',
    kind: 'fruit',
    group: 'kiselotranovi',
    wild: true,
    season: months('peak', 8, 9),
    cautions: ['protected'],
  },
  tuchenitsa: {
    name: 'Тученица',
    latinName: 'Portulaca oleracea',
    kind: 'vegetable',
    group: 'tuchenitsovi',
    wild: true,
    season: months('available', 6, 7, 8),
    cautions: ['preparation', 'protected'],
  },
  'godzhi-beri': {
    name: 'Годжи бери',
    latinName: 'Lycium barbarum',
    kind: 'fruit',
    group: 'kartofovi',
    wild: false,
    season: { ...months('peak', 9), ...months('available', 10) },
    cautions: ['toxic-part'],
  },
  'kamchatska-borovinka': {
    name: 'Камчатска боровинка',
    latinName: 'Lonicera kamtschatica',
    kind: 'fruit',
    group: 'nokatovi',
    wild: false,
    season: months('peak', 6, 7),
    cautions: [],
  },
};
const SLUGS = Object.keys(ADDED);

/** Left-out candidates (section 3) and the wild duplicates of existing entries. */
const LEFT_OUT = [
  'lapad',
  'byala-kucha-loboda',
  'diva-cheresha',
  'obiknovena-hvoyna',
  'mecho-grozde',
  'iglika',
  'diva-morkva',
  'buchinish',
  'bazak',
  'cherven-baz',
  'momina-salza',
  'mrazovets',
  'konski-kesten',
  'kavkazka-borovinka',
  'cherno-frensko-grozde',
  'bulgarska-krusha',
  'diva-krusha',
  'diva-shipka',
  'diva-menta',
  'gorska-malina',
  'gorska-kapina',
];

const ZBR_URL =
  'https://www.moew.government.bg/static/media/ups/tiny/filebase/Nature/Legislation/ZAKON_za_biologichnoto_raznoobrazie24.pdf';
const ORDER_2026_URL =
  'https://www.moew.government.bg/static/media/ups/tiny/filebase/Nature/Legislation/Zapovedi/MedicinalPlants/RD-178-18.02.2026-MedPlants.pdf';

/** The caution each existing entry gains (section 5). */
const EXISTING: Readonly<Record<string, { kind: Kind; url: string }>> = {
  oblepiha: { kind: 'protected', url: ZBR_URL },
  rigan: { kind: 'protected', url: ORDER_2026_URL },
  mashterka: { kind: 'protected', url: ZBR_URL },
  kesteni: { kind: 'look-alike', url: 'https://www.bgfermer.bg/Article/7891605' },
};

const NEW_GROUPS = {
  koprivovi: 'Urticaceae',
  meshkovitsovi: 'Adoxaceae',
  kiselotranovi: 'Berberidaceae',
  tuchenitsovi: 'Portulacaceae',
  nokatovi: 'Caprifoliaceae',
} as const;
const FORBIDDEN = /богат|полез|лекува|действие/i;
/** An act or order named with its gazette number or order number and its year. */
const ACT_WITH_NUMBER_AND_YEAR = /(бр\.\s*\d+ от \d{4})|(№\s*\S+ от .*\d{4})/;
/** Press articles about livestock: never a caution source for people (QA 057). */
const LIVESTOCK_SOURCES = ['https://www.bgfermer.bg/Article/22826799'];

const readYaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const produceFile = (slug: string) => join(DATA_DIR, 'produce', `${slug}.yaml`);
const recordOf = (slug: string) => schema.parse(readYaml(produceFile(slug)));
const addedOf = (slug: string): Added => {
  const added = ADDED[slug];
  if (added === undefined) throw new Error(`unknown slug ${slug}`);
  return added;
};

describe('wild produce (spec 057)', () => {
  it.each(SLUGS)(
    'AC1: %s exists, is valid and has its name, Latin name, kind and group',
    (slug) => {
      expect(existsSync(produceFile(slug)), slug).toBe(true);
      const record = recordOf(slug);
      const added = addedOf(slug);
      expect(record.name).toBe(added.name);
      expect(record.latinName).toBe(added.latinName);
      expect(record.kind).toBe(added.kind);
      expect(record.group).toBe(added.group);
    },
  );

  it.each(SLUGS)('AC2: %s has the wild flag of the spec', (slug) => {
    expect(recordOf(slug).wild).toBe(addedOf(slug).wild);
  });

  it.each(SLUGS)('AC3: %s has the caution kinds of the spec with https sources', (slug) => {
    const { cautions } = recordOf(slug);
    expect(cautions.map((caution) => caution.kind)).toEqual(addedOf(slug).cautions);
    for (const caution of cautions) {
      expect(caution.source.url).toMatch(/^https:\/\//);
      expect(caution.source.url).not.toMatch(/wikipedia\.org/i);
      if (caution.source.url === ORDER_2026_URL) expect(caution.text).toContain('2026');
    }
  });

  it.each(SLUGS)('AC4: %s has the season of the spec table', (slug) => {
    const season = Object.fromEntries(
      recordOf(slug).season.map((entry) => [entry.month, entry.level]),
    );
    expect(season).toEqual(addedOf(slug).season);
  });

  it.each(SLUGS)('AC5: %s cites its USDA record or gives no nutrition', (slug) => {
    const { fdcId } = addedOf(slug);
    const nutrition = recordOf(slug).nutrition;
    if (fdcId === undefined) {
      expect(nutrition).toBeUndefined();
      return;
    }
    expect(nutrition?.source.url).toBe(`https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`);
  });

  it.each(SLUGS)('AC6: %s names no province and cites no gradinata.bg page', (slug) => {
    expect(recordOf(slug).regions).toEqual([]);
    expect(readFileSync(produceFile(slug), 'utf8')).not.toMatch(/gradinata\.bg/i);
  });

  it.each(SLUGS)('AC7: %s has its Unsplash photo or none', (slug) => {
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

  it.each(SLUGS)('AC8: %s makes no health claim and has no uses or organic block', (slug) => {
    const record = recordOf(slug);
    const texts = [
      record.summary,
      record.photo?.alt ?? '',
      ...record.cautions.map((caution) => caution.text),
    ];
    for (const text of texts) expect(text, slug).not.toMatch(FORBIDDEN);
    expect(record.traditionalUses).toEqual([]);
    expect(record.organic).toBeUndefined();
  });

  it.each(LEFT_OUT)('AC9: %s is left out', (slug) => {
    expect(existsSync(produceFile(slug))).toBe(false);
  });

  it.each(Object.entries(EXISTING))('AC10: %s gains its sourced caution', (slug, expected) => {
    const record = recordOf(slug);
    expect(record.wild).toBe(false);
    expect(record.cautions.map(({ kind, source }) => ({ kind, url: source.url }))).toEqual([
      expected,
    ]);
    for (const caution of record.cautions) expect(caution.text).not.toMatch(FORBIDDEN);
  });

  it('AC10: the oregano caution names the year of the МОСВ order', () => {
    expect(recordOf('rigan').cautions[0]?.text).toContain('2026');
  });

  it.each(Object.entries(NEW_GROUPS))('AC11: group %s is %s', (id, latinName) => {
    const group = readYaml(join(DATA_DIR, 'groups', `${id}.yaml`)) as { latinName: string };
    expect(group.latinName).toBe(latinName);
  });

  it('QA 057: ramsons warns of autumn crocus from the poison-centre case series', () => {
    const lookAlikes = recordOf('levurda').cautions.filter(
      (caution) => caution.kind === 'look-alike',
    );
    const urls = lookAlikes.map((caution) => caution.source.url);
    expect(urls).toContain('https://pubmed.ncbi.nlm.nih.gov/33156711/');
    expect(urls).toContain('https://pubmed.ncbi.nlm.nih.gov/16626006/');
    expect(lookAlikes.some((caution) => caution.text.includes('мразовец'))).toBe(true);
    expect(lookAlikes.some((caution) => caution.text.includes('чесън'))).toBe(true);
  });

  it('QA 057: elder cites no livestock article, no „safe“ claim and needs heat treatment', () => {
    const { cautions, summary } = recordOf('cheren-baz');
    for (const caution of cautions) {
      expect(LIVESTOCK_SOURCES).not.toContain(caution.source.url);
      expect(caution.text).not.toMatch(/безопасн/i);
    }
    expect(cautions.some((caution) => caution.kind === 'preparation')).toBe(true);
    expect(summary).toContain('края на пролетта');
  });

  it.each([
    ['cheren-baz', 'Sambucus deborensis'],
    ['glog', 'Crataegus microphylla'],
    ['glog', 'C. stevenii'],
    ['cherna-borovinka', 'Vaccinium arctostaphyllos'],
  ])('QA 057: %s names its protected relative %s', (slug, latin) => {
    const zbr = recordOf(slug).cautions.filter(
      (caution) => caution.kind === 'protected' && caution.source.url === ZBR_URL,
    );
    expect(zbr.some((caution) => caution.text.includes(latin))).toBe(true);
  });

  it.each([
    ['kisel-tran', '10 кг плодове'],
    ['rigan', '2 кг стръкове'],
  ])('QA 057: %s states the personal-needs amount %s', (slug, amount) => {
    const yearly = recordOf(slug).cautions.filter(
      (caution) => caution.source.url === ORDER_2026_URL,
    );
    expect(yearly.some((caution) => caution.text.includes(amount))).toBe(true);
  });

  it('QA 057: every protected caution cites an act or order with its number and year', () => {
    const slugs = [...SLUGS, ...Object.keys(EXISTING)];
    for (const slug of slugs) {
      for (const caution of recordOf(slug).cautions.filter(({ kind }) => kind === 'protected')) {
        expect(caution.source.name, slug).toMatch(ACT_WITH_NUMBER_AND_YEAR);
      }
    }
  });

  it('QA 057: rowan and purslane cautions stay with their sources', () => {
    const rowan = recordOf('ofika')
      .cautions.map((caution) => caution.text)
      .join(' ');
    expect(rowan).not.toContain('не ги яж');
    expect(rowan).toContain('лечебно растение');
    const purslane = recordOf('tuchenitsa').cautions.find(({ kind }) => kind === 'preparation');
    expect(purslane?.text).toContain('водата');
  });

  it('QA 057: dandelion lists manganese, which ties with copper and sorts first by name', () => {
    const nutrients = recordOf('gluharche').nutrition?.micronutrients.map(
      ({ nutrient }) => nutrient,
    );
    expect(nutrients).toContain('mangan');
    expect(nutrients).not.toContain('med-cu');
  });

  it('QA 057: the old honeysuckle group id is gone', () => {
    expect(existsSync(join(DATA_DIR, 'groups', 'bazovi.yaml'))).toBe(false);
  });

  it('AC12: the checklist has a row per new produce', () => {
    const lines = readFileSync('docs/content-review/README.md', 'utf8').split('\n');
    for (const slug of SLUGS) {
      expect(
        lines.some((line) => line.startsWith(`| \`${slug}\``)),
        slug,
      ).toBe(true);
    }
  });
});
