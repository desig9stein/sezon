import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { readSeedCollection } from '@tests/fixtures/seedData';

const schema = produceSchemaWith({ image: testImage });
const entries = readSeedCollection('produce').map(({ id, data }) => ({
  id,
  growing: schema.parse(data).growing,
}));

describe('seed growing guides', () => {
  it.each(entries.map(({ id, growing }) => [id, growing]))(
    'AC6: %s has a growing guide with an https source',
    (_id, growing) => {
      expect(growing).toBeDefined();
      expect(growing?.source.url).toMatch(/^https:\/\//);
    },
  );
});
