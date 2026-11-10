import { describe, expect, it } from 'vitest';
import { Nutrient } from '@contexts/catalog';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';

const vitaminC = Nutrient.create({
  slug: 'vitamin-c',
  name: 'Витамин C',
  kind: 'vitamin',
  unit: 'mg',
  referenceIntake: 80,
  ...NUTRIENT_CLAIMS,
  note: 'Бележка.',
});

describe('Nutrient (spec 011)', () => {
  it.each([
    [24, 'high'],
    [40, 'high'],
    [23.9, 'source'],
    [12, 'source'],
    [11.9, undefined],
    [0, undefined],
  ] as const)('AC1: %s mg per 100 g gives claim level %s', (amount, level) => {
    expect(vitaminC.claimLevel(amount)).toBe(level);
  });

  it('AC1: exposes the authorised claims, their source and the note', () => {
    expect(vitaminC.claims).toEqual(NUTRIENT_CLAIMS.claims);
    expect(vitaminC.claimsSource).toEqual(NUTRIENT_CLAIMS.claimsSource);
    expect(vitaminC.note).toBe('Бележка.');
    expect(Object.isFrozen(vitaminC.claims)).toBe(true);
  });
});
