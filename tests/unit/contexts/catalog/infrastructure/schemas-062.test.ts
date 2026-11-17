import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { MINIMAL_PRODUCE_INPUT } from '@tests/fixtures/records';

const schema = produceSchemaWith({ image: testImage });

describe('produce aliases schema (spec 062)', () => {
  it('AC11: defaults aliases to an empty list and accepts a list of names', () => {
    expect(schema.parse(MINIMAL_PRODUCE_INPUT).aliases).toEqual([]);
    expect(schema.parse({ ...MINIMAL_PRODUCE_INPUT, aliases: ['чушки'] }).aliases).toEqual([
      'чушки',
    ]);
  });

  it('AC11: rejects duplicate aliases', () => {
    expect(schema.safeParse({ ...MINIMAL_PRODUCE_INPUT, aliases: ['а', 'а'] }).success).toBe(false);
  });
});
