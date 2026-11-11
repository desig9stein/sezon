import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { growingRecord } from '@tests/fixtures/growing';
import { testImage } from '@tests/fixtures/photos';
import { produceRecord } from '@tests/fixtures/records';

const schema = produceSchemaWith({ image: testImage });
const record = (growing?: unknown) => ({
  ...produceRecord(),
  updatedAt: '2026-11-10',
  ...(growing === undefined ? {} : { growing }),
});
const valid = (growing?: unknown) => schema.safeParse(record(growing)).success;

describe('growing schema', () => {
  it('AC1: accepts a valid growing block and a produce without one', () => {
    expect(valid()).toBe(true);
    expect(valid(growingRecord())).toBe(true);
    expect(
      valid(growingRecord({ sow: [], transplant: [], plantingNote: 'Засажда се наесен.' })),
    ).toBe(true);
  });

  it.each([
    ['duplicate months', growingRecord({ sow: [3, 3] })],
    ['a month out of range', growingRecord({ plant: [13] })],
    ['too few tips', growingRecord({ tips: ['Една.', 'Две.'] })],
    ['too many tips', growingRecord({ tips: ['1.', '2.', '3.', '4.', '5.', '6.'] })],
    ['a tip over 140 characters', growingRecord({ tips: ['а'.repeat(141), 'б.', 'в.'] })],
    ['no months and no note', growingRecord({ sow: [], transplant: [], plant: [] })],
  ])('AC1: rejects %s', (_label, growing) => {
    expect(valid(growing)).toBe(false);
  });

  it('AC1: rejects a missing source', () => {
    const withoutSource = Object.fromEntries(
      Object.entries(growingRecord()).filter(([key]) => key !== 'source'),
    );
    expect(valid(withoutSource)).toBe(false);
  });
});
