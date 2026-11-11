import { describe, expect, it } from 'vitest';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';
import { Nutrient } from '@contexts/catalog';

const vitaminC = Nutrient.create({
  slug: 'vitamin-c',
  name: 'Витамин C',
  kind: 'vitamin',
  unit: 'mg',
  referenceIntake: 80,
  ...NUTRIENT_CLAIMS,
});

describe('Nutrient', () => {
  it.each([
    [36.6, 46],
    [80, 100],
    [0, 0],
    [133, 166],
  ])('AC5: %s mg is %s%% of the reference intake', (amount, percent) => {
    expect(vitaminC.percentOfReferenceIntake(amount)).toBe(percent);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(vitaminC)).toBe(true);
  });
});
