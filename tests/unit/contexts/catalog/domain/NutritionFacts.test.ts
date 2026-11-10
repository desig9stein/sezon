import { describe, expect, it } from 'vitest';
import { NutritionFacts } from '@contexts/catalog';
import { InvalidNutritionFactsError } from '@shared/domain/errors';

const VALID = {
  energyKcal: 25,
  proteinG: 1.28,
  fatG: 0.1,
  carbohydrateG: 5.8,
  fiberG: 2.5,
  micronutrients: [{ nutrientSlug: 'vitamin-c', amount: 36.6 }],
  source: { name: 'USDA', url: 'https://fdc.nal.usda.gov/' },
};

describe('NutritionFacts', () => {
  it('AC4: creates frozen facts from valid values', () => {
    const facts = NutritionFacts.create(VALID);
    expect(facts.energyKcal).toBe(25);
    expect(facts.sugarsG).toBeUndefined();
    expect(Object.isFrozen(facts)).toBe(true);
    expect(Object.isFrozen(facts.micronutrients)).toBe(true);
  });

  it.each([
    ['energyKcal', { energyKcal: -1 }],
    ['proteinG', { proteinG: -0.1 }],
    ['sugarsG', { sugarsG: -2 }],
    ['a micronutrient amount', { micronutrients: [{ nutrientSlug: 'vitamin-c', amount: -1 }] }],
    ['a non-finite value', { fatG: Number.NaN }],
  ])('AC4: rejects a negative or invalid %s', (_label, overrides) => {
    expect(() => NutritionFacts.create({ ...VALID, ...overrides })).toThrow(
      InvalidNutritionFactsError,
    );
  });

  it('AC4: rejects a repeated nutrient', () => {
    expect(() =>
      NutritionFacts.create({
        ...VALID,
        micronutrients: [
          { nutrientSlug: 'vitamin-c', amount: 1 },
          { nutrientSlug: 'vitamin-c', amount: 2 },
        ],
      }),
    ).toThrow(InvalidNutritionFactsError);
  });
});
