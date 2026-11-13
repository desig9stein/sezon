import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

const DATA_DIR = join(process.cwd(), 'src', 'data');
const schema = produceSchemaWith({ image: testImage });

/** The produce added by spec 043, with the cited FDC id, the group and the expected varieties. */
const ADDED = {
  kiselets: { fdcId: '170076', group: 'lapadovi', varieties: [] },
  'zelen-luk': { fdcId: '170005', group: 'amarilisovi', varieties: [] },
  chesan: { fdcId: '169230', group: 'amarilisovi', varieties: ['Юнак'] },
  marulya: { fdcId: '169247', group: 'slozhnotsvetni', varieties: ['Черна гюмюрджинска'] },
  repichki: { fdcId: '169276', group: 'krastotsvetni', varieties: ['Едри червени', 'Любими'] },
} as const;
const SLUGS = Object.keys(ADDED) as ReadonlyArray<keyof typeof ADDED>;
const GROWING_HOSTS = /(^|\.)(bgfermer\.bg|agrozona\.bg|bg\.wikipedia\.org|government\.bg)$/;
const FORBIDDEN = /богат|полез|лекува|действие/i;
/** Share of the reference intake from which a micronutrient is listed (spec 043). */
const LISTED_SHARE = 0.15;
const MIN_LISTED = 3;
const NOVEMBER = 11;
const referenceIntakeOf = (nutrient: string) =>
  (readYaml(join(DATA_DIR, 'nutrients', `${nutrient}.yaml`)) as { referenceIntake: number })
    .referenceIntake;
const monthsOf = (slug: string) => recordOf(slug).season.map((entry) => entry.month);
const NEW_GROUPS = { lapadovi: 'Polygonaceae', slozhnotsvetni: 'Asteraceae' } as const;

const readYaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const produceFile = (slug: string) => join(DATA_DIR, 'produce', `${slug}.yaml`);
const recordOf = (slug: string) => schema.parse(readYaml(produceFile(slug)));

describe('spring greens and wild plants (spec 043)', () => {
  it.each(SLUGS)('AC1: %s exists and is a valid produce', (slug) => {
    expect(existsSync(produceFile(slug)), slug).toBe(true);
    expect(() => recordOf(slug)).not.toThrow();
  });

  it.each(SLUGS)('AC2: %s cites its USDA SR Legacy record', (slug) => {
    expect(recordOf(slug).nutrition?.source.url).toBe(
      `https://fdc.nal.usda.gov/food-details/${ADDED[slug].fdcId}/nutrients`,
    );
  });

  it.each(SLUGS)('AC3: %s names no province', (slug) => {
    expect(recordOf(slug).regions).toEqual([]);
  });

  it.each(SLUGS)('AC4: %s lists only the sourced varieties', (slug) => {
    expect(recordOf(slug).varieties.map((variety) => variety.name)).toEqual(ADDED[slug].varieties);
  });

  it.each(SLUGS)('AC5: %s has a growing guide from reliable sources', (slug) => {
    const growing = recordOf(slug).growing;
    expect(growing).toBeDefined();
    for (const source of growing?.sources ?? []) {
      expect(new URL(source.url).hostname, source.url).toMatch(GROWING_HOSTS);
    }
  });

  it.each(SLUGS)(
    'AC6: %s has an Unsplash photo, no traditional uses and no organic block',
    (slug) => {
      const record = recordOf(slug);
      expect(new URL(record.photo?.credit.sourceUrl ?? 'https://invalid').hostname).toBe(
        'unsplash.com',
      );
      expect(record.traditionalUses).toEqual([]);
      expect(record.organic).toBeUndefined();
    },
  );

  it.each(SLUGS)('AC7: %s makes no health claim', (slug) => {
    const record = recordOf(slug);
    const texts = [
      record.summary,
      record.howToChoose,
      record.storage,
      ...record.preparation.flatMap((item) => [item.method, item.tip]),
      ...record.varieties.flatMap((variety) => (variety.note === undefined ? [] : [variety.note])),
      ...record.faq.flatMap((item) => [item.question, item.answer]),
      ...(record.growing?.tips ?? []),
      ...(record.growing?.plantingNote === undefined ? [] : [record.growing.plantingNote]),
      record.photo?.alt ?? '',
    ];
    for (const text of texts) expect(text, slug).not.toMatch(FORBIDDEN);
  });

  it.each(SLUGS)('AC8: %s belongs to its group', (slug) => {
    expect(recordOf(slug).group).toBe(ADDED[slug].group);
  });

  it.each(Object.entries(NEW_GROUPS))('AC8: group %s is %s', (id, latinName) => {
    const group = readYaml(join(DATA_DIR, 'groups', `${id}.yaml`)) as { latinName: string };
    expect(group.latinName).toBe(latinName);
  });

  it('AC9: the checklist has a row per new produce and the guide names nettle as left out', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const slug of SLUGS) {
      expect(
        checklist.split('\n').some((line) => line.startsWith(`| \`${slug}\``)),
        slug,
      ).toBe(true);
    }
    expect(readFileSync('docs/CONTENT-GUIDE.md', 'utf8')).toMatch(/nettle/i);
  });

  it.each(SLUGS)('QA 043: %s lists low micronutrients only to reach three', (slug) => {
    const shares = (recordOf(slug).nutrition?.micronutrients ?? []).map(
      ({ nutrient, amount }) => amount / referenceIntakeOf(nutrient),
    );
    const high = shares.filter((share) => share >= LISTED_SHARE).length;
    if (high >= MIN_LISTED) expect(high, slug).toBe(shares.length);
    else expect(shares.length, slug).toBeLessThanOrEqual(MIN_LISTED);
  });

  it('QA 043: garlic lists no endangered local variety', () => {
    expect(recordOf('chesan').varieties.map((variety) => variety.name)).not.toContain('Зимен 14');
  });

  it('QA 043: the romaine photo is a romaine photo', () => {
    expect(recordOf('marulya').photo?.credit.sourceUrl).toMatch(/-sdDA-pMzW10$/);
    expect(recordOf('marulya').photo?.alt).toMatch(/маруля/i);
  });

  it('QA 043: autumn lettuce starts in October and runs to November', () => {
    const months = monthsOf('marulya');
    expect(months).not.toContain(9);
    expect(months).toContain(10);
    expect(months).toContain(NOVEMBER);
  });

  it('QA 043: green onions start in March', () => {
    expect(monthsOf('zelen-luk')).not.toContain(2);
  });

  it('QA 043: the garlic summary keeps bulbs through the winter', () => {
    expect(recordOf('chesan').summary).toContain('през зимата');
  });

  it('QA 043: the sorrel photo names sorrel', () => {
    expect(recordOf('kiselets').photo?.alt).toMatch(/^Листа киселец/);
  });
});
