import { describe, expect, it } from 'vitest';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { readSeedCollection } from '@tests/fixtures/seedData';

const MIN_REAL_FARMS = 10;
const farms = readSeedCollection('farms').map(({ id, data }) => ({
  id,
  ...farmSchema.parse(data),
}));
const produceIds = new Set(readSeedCollection('produce').map(({ id }) => id));
const regionIds = new Set(readSeedCollection('regions').map(({ id }) => id));

describe('seed farms (spec 021)', () => {
  it('AC3: has at least 10 farms', () => {
    expect(farms.length).toBeGreaterThanOrEqual(MIN_REAL_FARMS);
  });

  it('AC3: uses no example contacts', () => {
    const fake = farms.filter(({ contact }) =>
      [contact.website, contact.email, contact.phone].some(
        (value) => value !== undefined && /example\.(com|org)|^\+359000/.test(value),
      ),
    );
    expect(fake.map(({ id }) => id)).toEqual([]);
  });

  it('AC3: every farm sells seed produce in an existing region', () => {
    for (const farm of farms) {
      expect(regionIds.has(farm.region), farm.id).toBe(true);
      expect(
        farm.produce.every((slug) => produceIds.has(slug)),
        farm.id,
      ).toBe(true);
    }
  });
});
