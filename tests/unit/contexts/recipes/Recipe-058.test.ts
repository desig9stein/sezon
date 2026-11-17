import { describe, expect, it } from 'vitest';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { InvalidRecipeError } from '@shared/domain/errors';
import { rawRecipeRecord, recipeInput } from '@tests/fixtures/recipes';
import { Recipe, type RecipeInput } from '@contexts/recipes';

/** The altitude bands of the fixture recipe (pears, 950 ml jar, lowest band 25 minutes). */
const BANDS = [
  { fromMetres: 300, minutes: 30 },
  { fromMetres: 900, minutes: 35 },
  { fromMetres: 1800, minutes: 40 },
];

const withBands = (bands: unknown): RecipeInput =>
  ({ ...recipeInput(), processingAtAltitude: bands }) as unknown as RecipeInput;

describe('water-bath time by altitude (spec 058)', () => {
  it('AC10: keeps the altitude bands, frozen', () => {
    const recipe = Recipe.create(withBands(BANDS)) as Recipe & {
      processingAtAltitude: ReadonlyArray<{ fromMetres: number; minutes: number }>;
    };
    expect(recipe.processingAtAltitude).toEqual(BANDS);
    expect(Object.isFrozen(recipe.processingAtAltitude)).toBe(true);
    expect(Object.isFrozen(recipe.processingAtAltitude[0])).toBe(true);
  });

  it.each([
    ['no band', []],
    ['a band at 0 m', [{ fromMetres: 0, minutes: 30 }]],
    ['a fractional altitude', [{ fromMetres: 300.5, minutes: 30 }]],
    [
      'altitudes that do not increase',
      [
        { fromMetres: 900, minutes: 30 },
        { fromMetres: 300, minutes: 35 },
      ],
    ],
    ['minutes below the lowest band', [{ fromMetres: 300, minutes: 20 }]],
    [
      'decreasing minutes',
      [
        { fromMetres: 300, minutes: 35 },
        { fromMetres: 900, minutes: 30 },
      ],
    ],
    ['fractional minutes', [{ fromMetres: 300, minutes: 30.5 }]],
  ])('AC10: rejects %s', (_label, bands) => {
    expect(() => Recipe.create(withBands(bands))).toThrow(InvalidRecipeError);
  });

  it('AC10: the schema requires at least one altitude band', () => {
    const withoutBands = Object.fromEntries(
      Object.entries(rawRecipeRecord()).filter(([key]) => key !== 'processingAtAltitude'),
    );
    expect(recipeSchema.safeParse(withoutBands).success).toBe(false);
    expect(recipeSchema.safeParse(rawRecipeRecord({ processingAtAltitude: [] })).success).toBe(
      false,
    );
    const result = recipeSchema.safeParse(rawRecipeRecord({ processingAtAltitude: BANDS }));
    expect(result.error?.issues ?? []).toEqual([]);
  });
});
