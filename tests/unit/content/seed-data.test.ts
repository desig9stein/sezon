import { describe, expect, it } from 'vitest';
import type { z } from 'astro/zod';
import {
  groupSchema,
  nutrientSchema,
  produceSchemaWith,
} from '@contexts/catalog/infrastructure/schemas';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { findBrokenReferences, type ContentRecords } from '@composition/contentIntegrity';
import { Slug } from '@shared/domain/Slug';
import { testImage } from '@tests/fixtures/photos';
import { readSeedCollection } from '@tests/fixtures/seedData';

function parseCollection<T extends z.ZodType>(collection: string, schema: T) {
  return readSeedCollection(collection).map(({ id, data }) => {
    const result = schema.safeParse(data);
    return { id, result };
  });
}

const collections = {
  produce: parseCollection('produce', produceSchemaWith({ image: testImage })),
  groups: parseCollection('groups', groupSchema),
  nutrients: parseCollection('nutrients', nutrientSchema),
  regions: parseCollection('regions', regionSchema),
  farms: parseCollection('farms', farmSchema),
};

const recipes = parseCollection('recipes', recipeSchema);

function validRecords<T>(entries: { id: string; result: z.ZodSafeParseResult<T> }[]) {
  return new Map(
    entries.flatMap(({ id, result }) => (result.success ? [[id, result.data] as const] : [])),
  );
}

const records: ContentRecords = {
  produce: validRecords(collections.produce),
  groups: validRecords(collections.groups),
  nutrients: validRecords(collections.nutrients),
  regions: validRecords(collections.regions),
  farms: validRecords(collections.farms),
  recipes: validRecords(recipes),
};

describe('seed data', () => {
  for (const [name, entries] of Object.entries(collections)) {
    it(`AC9: every ${name} entry matches its schema`, () => {
      const failures = entries
        .filter(({ result }) => !result.success)
        .map(({ id, result }) => `${id}: ${result.error?.message ?? ''}`);
      expect(failures).toEqual([]);
    });

    it(`AC10: every ${name} id equals the slug of its name`, () => {
      const mismatches = entries.flatMap(({ id, result }) => {
        if (!result.success) return [];
        const expected = Slug.fromBulgarian((result.data as { name: string }).name).value;
        return expected === id ? [] : [`${id} should be ${expected}`];
      });
      expect(mismatches).toEqual([]);
    });
  }

  it('AC11: every reference points to an existing entry', () => {
    expect(findBrokenReferences(records)).toEqual([]);
  });

  it('AC12: has 28 regions and at least 12 produce', () => {
    expect(records.regions.size).toBe(28);
    expect(records.produce.size).toBeGreaterThanOrEqual(12);
  });
});

describe('findBrokenReferences', () => {
  it('AC11: reports every kind of reference to a missing entry', () => {
    const produce = produceSchemaWith({ image: testImage }).parse({
      ...(readSeedCollection('produce').find(({ id }) => id === 'zele')?.data as object),
      group: 'missing-group',
    });
    const farm = farmSchema.parse({
      ...(readSeedCollection('farms')[0]?.data as object),
      region: 'missing-region',
      produce: ['missing-produce'],
    });
    const broken = findBrokenReferences({
      produce: new Map([['zele', produce]]),
      groups: new Map(),
      nutrients: new Map(),
      regions: new Map(),
      farms: new Map([['ferma', farm]]),
      recipes: new Map(),
    });
    expect(broken).toEqual([
      'produce/zele → groups/missing-group',
      ...produce.regions.map(({ region }) => `produce/zele → regions/${region}`),
      ...produce.nutrition.micronutrients.map(
        ({ nutrient }) => `produce/zele → nutrients/${nutrient}`,
      ),
      'farms/ferma → regions/missing-region',
      'farms/ferma → produce/missing-produce',
    ]);
  });
});

describe('health wording', () => {
  const EFFECT_WORDS = /лекува|лечение|действие|предпазва|понижава|повишава|укрепва|полезн/i;

  it('traditional uses, summaries and FAQ avoid health-effect wording', () => {
    const offending = [...records.produce.entries()].flatMap(([id, item]) =>
      [
        item.summary,
        ...item.traditionalUses.map((use) => use.use),
        ...item.faq.flatMap((entry) => [entry.question, entry.answer]),
        ...item.preparation.map((entry) => entry.tip),
      ]
        .filter((text) => EFFECT_WORDS.test(text))
        .map((text) => `${id}: ${text}`),
    );
    expect(offending).toEqual([]);
  });
});

describe('produce names', () => {
  it('QA 004: are unique', () => {
    const names = [...records.produce.values()].map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
