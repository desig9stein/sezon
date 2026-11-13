import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { readSeedCollection } from '@tests/fixtures/seedData';

const ALT_MIN_LENGTH = 10;
const ALT_MAX_LENGTH = 120;
const PRODUCE_DIR = join(process.cwd(), 'src', 'data', 'produce');
const schema = produceSchemaWith({ image: testImage });

const entries = readSeedCollection('produce')
  .map(({ id, data }) => ({ id, record: schema.parse(data) }))
  .filter(({ record }) => record.photo !== undefined);

describe('seed photos', () => {
  it.each(entries.map(({ id }) => id))(
    'AC2 (spec 049): the photo of %s, when present, has alt and credit',
    (id) => {
      const entry = entries.find((candidate) => candidate.id === id);
      const photo = entry?.record.photo;
      expect(photo).toBeDefined();
      if (photo === undefined || entry === undefined) return;
      const alt = photo.alt.trim();
      expect(alt.length).toBeGreaterThanOrEqual(ALT_MIN_LENGTH);
      expect(alt.length).toBeLessThanOrEqual(ALT_MAX_LENGTH);
      expect(alt.toLowerCase()).not.toBe(entry.record.name.toLowerCase());
      expect(photo.credit.author.length).toBeGreaterThan(0);
      expect(existsSync(resolve(dirname(join(PRODUCE_DIR, `${id}.yaml`)), photo.src.src))).toBe(
        true,
      );
    },
  );
});
