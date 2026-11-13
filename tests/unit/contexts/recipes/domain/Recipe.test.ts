import { describe, expect, it } from 'vitest';
import { InvalidRecipeError } from '@shared/domain/errors';
import { aRecipe, recipeInput } from '@tests/fixtures/recipes';
import { Recipe, type RecipeInput } from '@contexts/recipes';

describe('Recipe (spec 048)', () => {
  it('AC1: creates a frozen recipe with frozen lists', () => {
    const recipe = aRecipe();
    expect(recipe.slug).toBe('kompot-ot-krushi');
    expect(recipe.name).toBe('Компот от круши');
    expect(recipe.category).toBe('compote');
    expect(recipe.waitDays).toBe(0);
    expect(Object.isFrozen(recipe)).toBe(true);
    expect(Object.isFrozen(recipe.ingredients)).toBe(true);
    expect(Object.isFrozen(recipe.ingredients[0])).toBe(true);
    expect(Object.isFrozen(recipe.steps)).toBe(true);
    expect(Object.isFrozen(recipe.safety)).toBe(true);
    expect(Object.isFrozen(recipe.safety.sources)).toBe(true);
    expect(Object.isFrozen(recipe.sources)).toBe(true);
    expect(Object.isFrozen(recipe.produceSlugs)).toBe(true);
  });

  it('AC1: does not share mutable input lists', () => {
    const steps = ['Измий крушите.'];
    const recipe = aRecipe({ steps });
    steps.push('Друго.');
    expect(recipe.steps).toEqual(['Измий крушите.']);
  });

  it('AC1: uses only its produce', () => {
    const recipe = aRecipe({ produceSlugs: ['krushi', 'yabalki'] });
    expect(recipe.uses('krushi')).toBe(true);
    expect(recipe.uses('yabalki')).toBe(true);
    expect(recipe.uses('zele')).toBe(false);
  });

  it('AC1: active minutes are prep plus cook plus processing', () => {
    expect(aRecipe({ prepMinutes: 30, cookMinutes: 10, processingMinutes: 25 }).activeMinutes).toBe(
      65,
    );
  });

  const invalid: ReadonlyArray<[string, Partial<RecipeInput>]> = [
    ['a slug that is not a slug', { slug: 'Компот' }],
    ['a blank title', { name: '  ' }],
    ['a blank summary', { summary: ' ' }],
    ['an unknown category', { category: 'soup' as RecipeInput['category'] }],
    ['no produce', { produceSlugs: [] }],
    ['a duplicate produce', { produceSlugs: ['krushi', 'krushi'] }],
    ['a blank yield', { yield: '' }],
    ['no ingredient', { ingredients: [] }],
    ['a blank ingredient name', { ingredients: [{ name: ' ', quantity: 1, unit: 'kg' }] }],
    ['a zero quantity', { ingredients: [{ name: 'Круши', quantity: 0, unit: 'kg' }] }],
    ['a negative quantity', { ingredients: [{ name: 'Круши', quantity: -1, unit: 'kg' }] }],
    [
      'an unknown unit',
      {
        ingredients: [
          {
            name: 'Круши',
            quantity: 1,
            unit: 'oz' as RecipeInput['ingredients'][number]['unit'],
          },
        ],
      },
    ],
    ['no step', { steps: [] }],
    ['a blank step', { steps: ['Измий.', ' '] }],
    ['a negative prep time', { prepMinutes: -1 }],
    ['a fractional cook time', { cookMinutes: 2.5 }],
    ['a negative processing time', { processingMinutes: -5 }],
    ['a fractional wait', { waitDays: 0.5 }],
    ['no recipe source', { sources: [] }],
    ['a recipe source that is not HTTPS', { sources: [{ name: 'X', url: 'http://example.bg' }] }],
    ['no safety source', { safety: { ...recipeInput().safety, sources: [] } }],
    [
      'a safety source that is not HTTPS',
      { safety: { ...recipeInput().safety, sources: [{ name: 'X', url: 'ftp://example.bg' }] } },
    ],
    ['a blank safety note', { safety: { ...recipeInput().safety, note: ' ' } }],
    ['a blank storage note', { safety: { ...recipeInput().safety, storage: '' } }],
    ['a blank sterilisation note', { safety: { ...recipeInput().safety, sterilisation: '' } }],
    ['an invalid date', { updatedAt: new Date('not a date') }],
    [
      'updatedAt before publishedAt',
      { publishedAt: new Date('2026-11-13'), updatedAt: new Date('2026-11-12') },
    ],
  ];

  it.each(invalid)('AC2: rejects %s', (_label, overrides) => {
    expect(() => Recipe.create(recipeInput(overrides))).toThrow(InvalidRecipeError);
  });
});
