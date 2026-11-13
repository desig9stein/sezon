import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { ui } from '@i18n/bg';
import { testImage } from '@tests/fixtures/photos';

interface Source {
  readonly name: string;
  readonly url: string;
}

interface ProduceFile {
  readonly kind: string;
  readonly group: string;
  readonly varieties: ReadonlyArray<{ readonly name: string }>;
  readonly regions: ReadonlyArray<{
    readonly region: string;
    readonly note: string;
    readonly source?: Source;
  }>;
  readonly nutrition: { readonly source: Source };
  readonly traditionalUses: ReadonlyArray<unknown>;
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
  readonly growing?: { readonly sources: ReadonlyArray<Source> };
}

const DATA_DIR = join(process.cwd(), 'src', 'data');
const PRODUCE_DIR = join(DATA_DIR, 'produce');
const MZH_HOST = 'www.mzh.government.bg';
const MZH_EDITION = 'реколта 2025';
const GROWING_HOSTS = new Set(['www.bgfermer.bg', 'bgfermer.bg', 'agrozona.bg']);
const BANNED_HOST = 'gradinata.bg';
const CHANGE_DATE = '2026-11-13';
const SOUTH_CENTRAL = ['plovdiv', 'pazardzhik'];
const SOUTH_EAST = ['burgas', 'sliven', 'yambol', 'stara-zagora'];

/** Expected data of each new produce (spec 041, section 5). */
const EXPECTED = {
  domati: {
    group: 'kartofovi',
    fdcId: '170457',
    description: 'Tomatoes, red, ripe, raw, year round average',
    regions: SOUTH_CENTRAL,
    varieties: ['Розово сърце', 'Алено сърце', 'Миляна VF'],
  },
  krastavitsi: {
    group: 'tikvovi',
    fdcId: '168409',
    description: 'Cucumber, with peel, raw',
    regions: SOUTH_EAST,
    varieties: ['Гергана', 'Тереза'],
  },
  piper: {
    group: 'kartofovi',
    fdcId: '170427',
    description: 'Peppers, sweet, green, raw',
    regions: SOUTH_CENTRAL,
    varieties: ['Куртовска капия', 'Ивайловска капия', 'Сиврия 600', 'Стряма'],
  },
  patladzhan: {
    group: 'kartofovi',
    fdcId: '169228',
    description: 'Eggplant, raw',
    regions: SOUTH_CENTRAL,
    varieties: ['Български 12'],
  },
} as const;
const SLUGS = Object.keys(EXPECTED) as ReadonlyArray<keyof typeof EXPECTED>;

const pathOf = (slug: string) => join(PRODUCE_DIR, `${slug}.yaml`);
const read = (slug: string): ProduceFile =>
  parse(readFileSync(pathOf(slug), 'utf8')) as ProduceFile;
const hostOf = (url: string) => new URL(url).hostname;
const schema = produceSchemaWith({ image: testImage });

describe('summer vegetables (spec 041)', () => {
  it.each(SLUGS)('AC1: %s exists, is valid and belongs to its group', (slug) => {
    expect(existsSync(pathOf(slug)), slug).toBe(true);
    const raw: unknown = parse(readFileSync(pathOf(slug), 'utf8'));
    expect(schema.safeParse(raw).success, slug).toBe(true);
    const produce = read(slug);
    expect(produce.kind).toBe('vegetable');
    expect(produce.group).toBe(EXPECTED[slug].group);
  });

  it('AC1: the Solanaceae group exists', () => {
    const path = join(DATA_DIR, 'groups', 'kartofovi.yaml');
    expect(existsSync(path)).toBe(true);
    const group = parse(readFileSync(path, 'utf8')) as { name: string; latinName: string };
    expect(group.name).toBe('Картофови');
    expect(group.latinName).toBe('Solanaceae');
  });

  it.each(SLUGS)('AC2: %s cites its USDA SR Legacy record', (slug) => {
    const { source } = read(slug).nutrition;
    expect(source.url).toBe(
      `https://fdc.nal.usda.gov/food-details/${EXPECTED[slug].fdcId}/nutrients`,
    );
    expect(source.name).toBe(`USDA FoodData Central, SR Legacy: ${EXPECTED[slug].description}`);
  });

  it.each(SLUGS)('AC3: %s names the provinces of the leading МЗХ region', (slug) => {
    const { regions } = read(slug);
    expect(regions.map((entry) => entry.region)).toEqual(EXPECTED[slug].regions);
    for (const entry of regions) {
      const where = `${slug}/${entry.region}`;
      expect(hostOf(entry.source?.url ?? 'https://invalid'), where).toBe(MZH_HOST);
      expect(entry.source?.name, where).toContain(MZH_EDITION);
      expect(entry.note, where).toContain('открити площи');
      expect(entry.note, where).toContain('2025');
      expect(entry.note, where).not.toMatch(/^Също/);
    }
  });

  it.each(SLUGS)('AC4: %s has an Unsplash photo with a credit', (slug) => {
    const { photo } = read(slug);
    expect(photo, slug).toBeDefined();
    if (photo === undefined) return;
    expect(photo.credit.author.length).toBeGreaterThan(0);
    expect(hostOf(photo.credit.authorUrl)).toBe('unsplash.com');
    expect(photo.credit.sourceName).toBe('Unsplash');
    expect(hostOf(photo.credit.sourceUrl)).toBe('unsplash.com');
    expect(existsSync(resolve(dirname(pathOf(slug)), photo.src))).toBe(true);
  });

  it.each(SLUGS)('AC5: %s has a growing guide from Bulgarian farming sites only', (slug) => {
    const produce = read(slug);
    expect(produce.growing, slug).toBeDefined();
    for (const source of produce.growing?.sources ?? []) {
      expect(GROWING_HOSTS.has(hostOf(source.url)), source.url).toBe(true);
    }
    expect(readFileSync(pathOf(slug), 'utf8')).not.toContain(BANNED_HOST);
  });

  it.each(SLUGS)('AC6: %s has no traditional uses, no „богат“ and the change date', (slug) => {
    const produce = read(slug);
    expect(produce.traditionalUses).toEqual([]);
    expect(readFileSync(pathOf(slug), 'utf8').toLowerCase()).not.toContain('богат');
    const updatedAt =
      produce.updatedAt instanceof Date
        ? produce.updatedAt.toISOString().slice(0, 10)
        : produce.updatedAt;
    expect(updatedAt).toBe(CHANGE_DATE);
  });

  it.each(SLUGS)('AC7: %s lists only varieties from the ИАСАС official list', (slug) => {
    expect(read(slug).varieties.map((variety) => variety.name)).toEqual(EXPECTED[slug].varieties);
  });

  it('AC8: the checklist has a row for each new produce', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const slug of SLUGS) {
      const row = checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '';
      expect(row, slug).toContain(EXPECTED[slug].fdcId);
      expect(row, slug).toContain('NUTS2');
    }
  });

  it('AC9: the methodology and about texts name the new МЗХ-sourced products', () => {
    for (const text of [ui.methodology.regions, ui.about.sources]) {
      for (const word of ['домат', 'пипер', 'патладжан', 'краставиц']) {
        expect(text, word).toContain(word);
      }
    }
  });
});

interface SeasonFile {
  readonly summary: string;
  readonly season: ReadonlyArray<{ readonly month: number; readonly level: string }>;
  readonly faq: ReadonlyArray<{ readonly question: string; readonly answer: string }>;
  readonly growing: { readonly sow: ReadonlyArray<number> };
  readonly photo: { readonly alt: string };
}

const seasonOf = (slug: string): SeasonFile =>
  parse(readFileSync(pathOf(slug), 'utf8')) as SeasonFile;
const levelIn = (slug: string, month: number) =>
  seasonOf(slug).season.find((entry) => entry.month === month)?.level;
const JANUARY = 1;

describe('summer vegetables QA (spec 041)', () => {
  it('QA 041: greenhouse tomatoes make April and May available', () => {
    expect(levelIn('domati', 4)).toBe('available');
    expect(levelIn('domati', 5)).toBe('available');
  });

  it('QA 041: open-field cucumbers peak from July, June is available', () => {
    expect(levelIn('krastavitsi', 6)).toBe('available');
    expect(levelIn('krastavitsi', 7)).toBe('peak');
    expect(levelIn('krastavitsi', 8)).toBe('peak');
    expect(seasonOf('krastavitsi').summary).toContain('от края на юни');
  });

  it('QA 041: the pepper note names the bulletin column and the page says which pepper', () => {
    for (const entry of read('piper').regions) {
      expect(entry.note, entry.region).toContain('пипер (вкл. лют)');
    }
    const pepper = seasonOf('piper');
    const texts = [pepper.summary, ...pepper.faq.map((item) => item.answer)].join(' ');
    expect(texts).toContain('зелен сладък пипер');
    expect(readFileSync(pathOf('piper'), 'utf8')).not.toMatch(/\d mg\b/);
  });

  it('QA 041: early peppers and aubergines are sown from January, as the calendar says', () => {
    expect(seasonOf('piper').growing.sow).toContain(JANUARY);
    expect(seasonOf('patladzhan').growing.sow).toContain(JANUARY);
  });

  it('QA 041: the cucumber alt describes a heap', () => {
    expect(seasonOf('krastavitsi').photo.alt).toMatch(/^Купчина /);
  });

  it('QA 041: the content guide lists the new МЗХ-sourced vegetables', () => {
    const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
    const status = guide.slice(guide.indexOf('## Seed data status'));
    for (const word of ['tomatoes', 'peppers', 'aubergines', 'cucumbers', 'spec 041']) {
      expect(status, word).toContain(word);
    }
  });
});
