import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { readSeedCollection } from '@tests/fixtures/seedData';

const schema = produceSchemaWith({ image: testImage });

describe('seed organic data', () => {
  it('AC6: organic blocks cite https sources', () => {
    const blocks = readSeedCollection('produce')
      .map(({ data }) => schema.parse(data).organic)
      .filter((organic) => organic !== undefined);
    expect(blocks.length).toBeGreaterThan(0);
    for (const organic of blocks) {
      for (const source of organic.sources) expect(source.url).toMatch(/^https:\/\//);
    }
  });

  it('AC6: no seed farm claims an organic certificate without verification', () => {
    const farms = readSeedCollection('farms').map(({ data }) => farmSchema.parse(data));
    expect(farms.filter((farm) => farm.organic !== undefined)).toEqual([]);
  });
});
