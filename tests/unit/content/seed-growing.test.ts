import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { readSeedCollection } from '@tests/fixtures/seedData';

const schema = produceSchemaWith({ image: testImage });
const entries = readSeedCollection('produce').flatMap(({ id, data }) => {
  const { growing } = schema.parse(data);
  return growing === undefined ? [] : [{ id, growing }];
});

describe('seed growing guides', () => {
  it.each(entries.map(({ id, growing }) => [id, growing]))(
    'AC6 (spec 049): the growing guide of %s, when present, has https sources',
    (_id, growing) => {
      expect(growing.sources.length).toBeGreaterThan(0);
      for (const source of growing.sources) expect(source.url).toMatch(/^https:\/\//);
    },
  );
});
