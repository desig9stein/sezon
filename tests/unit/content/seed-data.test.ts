import { describe, expect, it } from 'vitest';
import type { z } from 'astro/zod';
import {
  groupSchema,
  nutrientSchema,
  produceSchema,
} from '@contexts/catalog/infrastructure/schemas';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { findBrokenReferences, type ContentRecords } from '@composition/contentIntegrity';
import { Slug } from '@shared/domain/Slug';
import { readSeedCollection } from '@tests/fixtures/seedData';

function parseCollection<T extends z.ZodType>(collection: string, schema: T) {
  return readSeedCollection(collection).map(({ id, data }) => {
    const result = schema.safeParse(data);
    return { id, result };
  });
}

const collections = {
  produce: parseCollection('produce', produceSchema),
  groups: parseCollection('groups', groupSchema),
  nutrients: parseCollection('nutrients', nutrientSchema),
  regions: parseCollection('regions', regionSchema),
  farms: parseCollection('farms', farmSchema),
};

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

  it('AC12: has 28 regions, at least 12 produce and only placeholder farms', () => {
    expect(records.regions.size).toBe(28);
    expect(records.produce.size).toBeGreaterThanOrEqual(12);
    expect([...records.farms.values()].every((farm) => farm.isPlaceholder)).toBe(true);
    expect(
      [...records.produce.values()].every((item) =>
        ['draft', 'reviewed'].includes(item.reviewStatus),
      ),
    ).toBe(true);
  });
});

describe('findBrokenReferences', () => {
  it('AC11: reports every kind of reference to a missing entry', () => {
    const produce = produceSchema.parse({
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

describe('placeholder farms', () => {
  it('AC12: use only example.com and +359000 contacts', () => {
    for (const farm of records.farms.values()) {
      if (!farm.isPlaceholder) continue;
      const { website, email, phone } = farm.contact;
      if (website !== undefined) expect(new URL(website).hostname).toBe('example.com');
      if (email !== undefined) expect(email).toMatch(/@example\.com$/);
      if (phone !== undefined) expect(phone).toMatch(/^\+359000/);
    }
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
