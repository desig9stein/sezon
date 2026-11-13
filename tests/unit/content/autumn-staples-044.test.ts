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
  readonly season: ReadonlyArray<{ readonly month: number; readonly level: string }>;
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
const GROWING_HOSTS = new Set([
  'www.bgfermer.bg',
  'bgfermer.bg',
  'agrozona.bg',
  'bg.wikipedia.org',
]);
const BANNED_HOST = 'gradinata.bg';
const CHANGE_DATE = '2026-11-13';
const SOUTH_WEST = ['blagoevgrad', 'kyustendil', 'pernik', 'sofia-grad', 'sofiyska'];
const SOUTH_EAST = ['burgas', 'sliven', 'yambol', 'stara-zagora'];
const WINTER_MONTHS = [12, 1, 2];

/** Expected data of each new produce (spec 044, section 5). */
const EXPECTED = {
  kartofi: {
    kind: 'vegetable',
    group: 'kartofovi',
    fdcId: '170026',
    description: 'Potatoes, flesh and skin, raw',
    regions: SOUTH_WEST,
    varieties: [],
  },
  luk: {
    kind: 'vegetable',
    group: 'amarilisovi',
    fdcId: '170000',
    description: 'Onions, raw',
    regions: SOUTH_EAST,
    varieties: ['Асеновградска 5', 'Лясковски 58', 'Испанска 482'],
  },
  brokoli: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    fdcId: '170379',
    description: 'Broccoli, raw',
    regions: [],
    varieties: ['ИЗК Искра'],
  },
  karfiol: {
    kind: 'vegetable',
    group: 'krastotsvetni',
    fdcId: '169986',
    description: 'Cauliflower, raw',
    regions: [],
    varieties: [],
  },
  kesteni: {
    kind: 'nut',
    group: 'bukovi',
    fdcId: '170574',
    description: 'Nuts, chestnuts, european, raw, unpeeled',
    regions: [],
    varieties: ['Вольотика', 'Морони'],
  },
} as const;
const SLUGS = Object.keys(EXPECTED) as ReadonlyArray<keyof typeof EXPECTED>;
const WITH_REGIONS = ['kartofi', 'luk'] as const;
const WITHOUT_REGIONS = ['brokoli', 'karfiol', 'kesteni'] as const;

const pathOf = (slug: string) => join(PRODUCE_DIR, `${slug}.yaml`);
const read = (slug: string): ProduceFile =>
  parse(readFileSync(pathOf(slug), 'utf8')) as ProduceFile;
const hostOf = (url: string) => new URL(url).hostname;
const groupOf = (id: string) =>
  parse(readFileSync(join(DATA_DIR, 'groups', `${id}.yaml`), 'utf8')) as {
    name: string;
    latinName: string;
  };
const schema = produceSchemaWith({ image: testImage });

describe('autumn and winter staples (spec 044)', () => {
  it.each(SLUGS)('AC1: %s exists, is valid and belongs to its group', (slug) => {
    expect(existsSync(pathOf(slug)), slug).toBe(true);
    const raw: unknown = parse(readFileSync(pathOf(slug), 'utf8'));
    expect(schema.safeParse(raw).success, slug).toBe(true);
    const produce = read(slug);
    expect(produce.kind).toBe(EXPECTED[slug].kind);
    expect(produce.group).toBe(EXPECTED[slug].group);
  });

  it('AC1: the Solanaceae and Fagaceae groups exist', () => {
    expect(groupOf('kartofovi')).toMatchObject({ name: 'Картофови', latinName: 'Solanaceae' });
    expect(groupOf('bukovi')).toMatchObject({ name: 'Букови', latinName: 'Fagaceae' });
  });

  it.each(SLUGS)('AC2: %s cites its USDA SR Legacy record', (slug) => {
    const { source } = read(slug).nutrition;
    expect(source.url).toBe(
      `https://fdc.nal.usda.gov/food-details/${EXPECTED[slug].fdcId}/nutrients`,
    );
    expect(source.name).toBe(`USDA FoodData Central, SR Legacy: ${EXPECTED[slug].description}`);
  });

  it.each(WITH_REGIONS)('AC3: %s names the provinces of the leading МЗХ region', (slug) => {
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

  it.each(WITHOUT_REGIONS)('AC4: %s has no regions (no official provincial data)', (slug) => {
    expect(read(slug).regions).toEqual([]);
  });

  it.each(SLUGS)('AC5: %s has an Unsplash photo with a credit', (slug) => {
    const { photo } = read(slug);
    expect(photo, slug).toBeDefined();
    if (photo === undefined) return;
    expect(photo.credit.author.length).toBeGreaterThan(0);
    expect(hostOf(photo.credit.authorUrl)).toBe('unsplash.com');
    expect(photo.credit.sourceName).toBe('Unsplash');
    expect(hostOf(photo.credit.sourceUrl)).toBe('unsplash.com');
    expect(existsSync(resolve(dirname(pathOf(slug)), photo.src))).toBe(true);
  });

  it.each(SLUGS)('AC6: %s has a growing guide from reliable Bulgarian sources only', (slug) => {
    const produce = read(slug);
    expect(produce.growing, slug).toBeDefined();
    for (const source of produce.growing?.sources ?? []) {
      expect(GROWING_HOSTS.has(hostOf(source.url)), source.url).toBe(true);
    }
    expect(readFileSync(pathOf(slug), 'utf8')).not.toContain(BANNED_HOST);
  });

  it.each(SLUGS)('AC7: %s has no traditional uses, no „богат“ and the change date', (slug) => {
    const produce = read(slug);
    expect(produce.traditionalUses).toEqual([]);
    expect(readFileSync(pathOf(slug), 'utf8').toLowerCase()).not.toContain('богат');
    const updatedAt =
      produce.updatedAt instanceof Date
        ? produce.updatedAt.toISOString().slice(0, 10)
        : produce.updatedAt;
    expect(updatedAt).toBe(CHANGE_DATE);
  });

  it.each(SLUGS)('AC8: %s lists only verified varieties', (slug) => {
    expect(read(slug).varieties.map((variety) => variety.name)).toEqual(EXPECTED[slug].varieties);
  });

  it.each(WITH_REGIONS)('AC9: %s is sold from storage in winter', (slug) => {
    const { season } = read(slug);
    for (const month of WINTER_MONTHS) {
      expect(season.find((entry) => entry.month === month)?.level, String(month)).toBe('storage');
    }
  });

  it('AC10: the checklist and the content guide record the new produce', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const slug of SLUGS) {
      const row = checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '';
      expect(row, slug).toContain(EXPECTED[slug].fdcId);
    }
    const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
    const status = guide.slice(guide.indexOf('## Seed data status'));
    expect(status).toContain('spec 044');
    expect(status).toContain('rosehip');
  });

  it('AC11: the methodology and about texts name potatoes and onions', () => {
    for (const text of [ui.methodology.regions, ui.about.sources]) {
      expect(text).toContain('картоф');
      expect(text).toMatch(/лук(?!\p{L})|лука/u);
    }
  });
});

interface QaFile {
  readonly summary: string;
  readonly storage: string;
  readonly season: ReadonlyArray<{ readonly month: number; readonly level: string }>;
  readonly nutrition: { readonly micronutrients: ReadonlyArray<{ readonly nutrient: string }> };
  readonly faq: ReadonlyArray<{ readonly question: string; readonly answer: string }>;
}

const qaOf = (slug: string): QaFile => parse(readFileSync(pathOf(slug), 'utf8')) as QaFile;
const faqText = (slug: string) =>
  qaOf(slug)
    .faq.map((entry) => `${entry.question} ${entry.answer}`)
    .join(' ');
const DECEMBER = 12;

describe('autumn and winter staples QA (spec 044)', () => {
  it('QA 044: chestnuts list no manganese (the USDA record includes the inner skin)', () => {
    const nutrients = qaOf('kesteni').nutrition.micronutrients.map((item) => item.nutrient);
    expect(nutrients).not.toContain('mangan');
  });

  it('QA 044: the chestnut FAQ says the values include the inner skin, without the shell', () => {
    const text = faqText('kesteni');
    expect(text).toContain('ципа');
    expect(text).toContain('без черупката');
  });

  it('QA 044: the horse-chestnut FAQ says they are poisonous', () => {
    expect(faqText('kesteni')).toContain('не стават за храна – отровни са');
  });

  it('QA 044: chestnuts are not in season in December, as the summary says', () => {
    expect(qaOf('kesteni').season.map((entry) => entry.month)).not.toContain(DECEMBER);
  });

  it('QA 044: potatoes are stored at 3–5 °C in the storage text and the FAQ', () => {
    const potatoes = qaOf('kartofi');
    expect(potatoes.storage).toContain('3–5 °C');
    expect(potatoes.storage).not.toContain('2–5 °C');
    expect(faqText('kartofi')).toContain('3–5 °C');
  });

  it('QA 044: the onion summary matches its source on the harvest time', () => {
    expect(qaOf('luk').summary).toContain('в края на юли и началото на август');
  });

  it('QA 044: the methodology lists potatoes and onions among statistical-region data', () => {
    const nuts2 = ui.methodology.regions.slice(ui.methodology.regions.indexOf('а за зеле'));
    expect(nuts2).toMatch(/^а за зеле[^;]*картофи и лук – по статистически райони/u);
  });

  it('QA 044: the checklist no longer speaks of „the other nine products“', () => {
    expect(readFileSync('docs/content-review/README.md', 'utf8')).not.toContain(
      'The other nine products',
    );
  });
});
