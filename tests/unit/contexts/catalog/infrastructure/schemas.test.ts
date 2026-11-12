import { describe, expect, it } from 'vitest';
import { produceSchema } from '@contexts/catalog/infrastructure/schemas';
import { produceRecord } from '@tests/fixtures/records';

describe('produceSchema', () => {
  it('AC1: accepts a valid record and coerces updatedAt to a Date', () => {
    const result = produceSchema.safeParse({ ...produceRecord(), updatedAt: '2026-11-10' });
    expect(result.success).toBe(true);
    expect(result.data?.updatedAt).toEqual(new Date('2026-11-10'));
  });

  it.each([
    [
      'a missing nutrition source',
      { nutrition: { ...produceRecord().nutrition, source: undefined } },
    ],
    ['a summary shorter than 70 characters', { summary: 'Твърде кратко.' }],
    ['a summary longer than 160 characters', { summary: 'а'.repeat(161) }],
    ['an empty region list', { regions: [] }],
    ['an empty season', { season: [] }],
    [
      'a duplicate season month',
      {
        season: [
          { month: 9, level: 'peak' },
          { month: 9, level: 'available' },
        ],
      },
    ],
    ['an unknown season level', { season: [{ month: 9, level: 'ripe' }] }],
    ['a month outside 1–12', { season: [{ month: 13, level: 'peak' }] }],
    [
      'a traditional use worded as a claim',
      {
        traditionalUses: [
          {
            system: 'ayurveda',
            use: 'Лекува стомаха.',
            source: { name: 'X', url: 'https://x.org' },
          },
        ],
      },
    ],
    [
      'a traditional use without source',
      { traditionalUses: [{ system: 'folk', use: 'Традиционно се използва при настинка.' }] },
    ],
    [
      'a non-https source url',
      { nutrition: { ...produceRecord().nutrition, source: { name: 'X', url: 'http://x.org' } } },
    ],
    ['an unknown kind', { kind: 'mushroom' }],
    ['an empty preparation list', { preparation: [] }],
    ['duplicate varieties', { varieties: [{ name: 'Бяло' }, { name: 'Бяло' }] }],
    ['a group that is not a slug', { group: 'Кръстоцветни' }],
    ['a negative energy value', { nutrition: { ...produceRecord().nutrition, energyKcal: -1 } }],
    ['a blank name', { name: '   ' }],
    ['a review status (spec 034, AC1)', { reviewStatus: 'draft' }],
  ])('AC2: rejects %s', (_label, overrides) => {
    const result = produceSchema.safeParse({ ...produceRecord(), ...overrides });
    expect(result.success).toBe(false);
  });
});
