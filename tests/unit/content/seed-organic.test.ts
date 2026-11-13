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

  it('AC6: only farms with a certificate verified in a spec have an organic block (#16, spec 051)', () => {
    const organic = readSeedCollection('farms')
      .filter(({ data }) => farmSchema.parse(data).organic !== undefined)
      .map(({ id }) => id);
    expect(organic).toEqual(['vkusnagradina']);
  });
});
