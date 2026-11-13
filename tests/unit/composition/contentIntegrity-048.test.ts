import { describe, expect, it } from 'vitest';
import { findBrokenReferences } from '@composition/contentIntegrity';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { rawRecipeRecord } from '@tests/fixtures/recipes';

describe('content integrity of recipes (spec 048)', () => {
  it('AC6: reports a recipe that refers to a missing produce', () => {
    const recipe = recipeSchema.parse(rawRecipeRecord({ produce: ['krushi', 'missing'] }));
    const broken = findBrokenReferences({
      produce: new Map(),
      groups: new Map(),
      nutrients: new Map(),
      regions: new Map(),
      farms: new Map(),
      recipes: new Map([['kompot-ot-krushi', recipe]]),
    });
    expect(broken).toEqual([
      'recipes/kompot-ot-krushi → produce/krushi',
      'recipes/kompot-ot-krushi → produce/missing',
    ]);
  });
});
