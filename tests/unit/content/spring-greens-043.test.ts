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
  chesan: { fdcId: '169230', group: 'amarilisovi', varieties: ['Юнак', 'Зимен 14'] },
  marulya: { fdcId: '169247', group: 'slozhnotsvetni', varieties: ['Черна маруля'] },
  repichki: { fdcId: '169276', group: 'krastotsvetni', varieties: ['Едри червени', 'Любими'] },
} as const;
const SLUGS = Object.keys(ADDED) as ReadonlyArray<keyof typeof ADDED>;
const GROWING_HOSTS = /(^|\.)(bgfermer\.bg|agrozona\.bg|bg\.wikipedia\.org|government\.bg)$/;
const FORBIDDEN = /богат|полез|лекува|действие/i;
const NEW_GROUPS = { lapadovi: 'Polygonaceae', slozhnotsvetni: 'Asteraceae' } as const;

const readYaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const produceFile = (slug: string) => join(DATA_DIR, 'produce', `${slug}.yaml`);
const recordOf = (slug: string) => schema.parse(readYaml(produceFile(slug)));

describe('spring greens and wild plants (spec 043)', () => {
  it.each(SLUGS)('AC1: %s exists and is a valid produce', (slug) => {
    expect(existsSync(produceFile(slug)), slug).toBe(true);
    expect(() => recordOf(slug)).not.toThrow();
  });

  it('AC1: nettle is left out', () => {
    expect(existsSync(produceFile('kopriva'))).toBe(false);
  });

  it.each(SLUGS)('AC2: %s cites its USDA SR Legacy record', (slug) => {
    expect(recordOf(slug).nutrition.source.url).toBe(
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
      ...record.preparation.map((item) => item.tip),
      ...record.faq.flatMap((item) => [item.question, item.answer]),
      ...(record.growing?.tips ?? []),
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
});
