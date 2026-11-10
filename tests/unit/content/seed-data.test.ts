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

  const records: ContentRecords = {
    produce: validRecords(collections.produce),
    groups: validRecords(collections.groups),
    nutrients: validRecords(collections.nutrients),
    regions: validRecords(collections.regions),
    farms: validRecords(collections.farms),
  };

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
  it('AC11: reports references to missing entries', () => {
    const produce = produceSchema.parse({
      ...(readSeedCollection('produce')[0]?.data as object),
      group: 'missing-group',
    });
    const broken = findBrokenReferences({
      produce: new Map([['zele', produce]]),
      groups: new Map(),
      nutrients: new Map(),
      regions: new Map(),
      farms: new Map(),
    });
    expect(broken).toContain('produce/zele → groups/missing-group');
    expect(broken.length).toBeGreaterThan(1);
  });
});
