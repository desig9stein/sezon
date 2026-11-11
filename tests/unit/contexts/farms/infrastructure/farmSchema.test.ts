import { describe, expect, it } from 'vitest';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { farmRecord } from '@tests/fixtures/records';

const valid = (record: object) => farmSchema.safeParse(record).success;

describe('farm schema (spec 021)', () => {
  it('AC1: accepts a valid farm with sources', () => {
    expect(valid(farmRecord())).toBe(true);
  });

  it('AC1: rejects a farm without sources', () => {
    const record: Partial<ReturnType<typeof farmRecord>> = farmRecord();
    delete record.sources;
    expect(valid(record)).toBe(false);
  });

  it.each([
    ['empty sources', { ...farmRecord(), sources: [] }],
    ['a non-https source', { ...farmRecord(), sources: ['http://example.org/ferma'] }],
    ['an isPlaceholder flag', { ...farmRecord(), isPlaceholder: false }],
  ])('AC1: rejects %s', (_label, record) => {
    expect(valid(record)).toBe(false);
  });
});
