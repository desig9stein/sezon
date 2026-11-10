import { describe, expect, it } from 'vitest';
import { NutritionFacts } from '@contexts/catalog';

const facts = NutritionFacts.create({
  energyKcal: 654,
  proteinG: 15.23,
  fatG: 65.21,
  carbohydrateG: 13.71,
  fiberG: 6.7,
  sugarsG: 2.61,
  micronutrients: [],
  source: { name: 'USDA', url: 'https://fdc.nal.usda.gov/' },
});

describe('NutritionFacts.percentOfReferenceIntake (QA 005)', () => {
  it.each([
    ['energyKcal', 33],
    ['fatG', 93],
    ['carbohydrateG', 5],
    ['sugarsG', 3],
    ['proteinG', 30],
  ] as const)('returns %% of the EU reference intake for %s', (macro, percent) => {
    expect(facts.percentOfReferenceIntake(macro)).toBe(percent);
  });

  it('returns undefined for fibre, which has no reference intake', () => {
    expect(facts.percentOfReferenceIntake('fiberG')).toBeUndefined();
  });
});
