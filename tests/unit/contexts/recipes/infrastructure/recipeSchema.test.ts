import { describe, expect, it } from 'vitest';
import { toRecipe } from '@contexts/recipes/infrastructure/mappers';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { rawRecipeRecord } from '@tests/fixtures/recipes';

const SUMMARY_TOO_SHORT = 'Кратко.';
const SUMMARY_TOO_LONG = 'Дълго. '.repeat(30);

describe('recipeSchema and toRecipe (spec 048)', () => {
  it('AC3: a valid record maps to a recipe and waitDays defaults to 0', () => {
    const recipe = toRecipe('kompot-ot-krushi', recipeSchema.parse(rawRecipeRecord()));
    expect(recipe.name).toBe('Компот от круши');
    expect(recipe.produceSlugs).toEqual(['krushi']);
    expect(recipe.waitDays).toBe(0);
    expect(recipe.ingredients[1]).toEqual({ name: 'Захар', quantity: 1, unit: 'cup' });
    expect(recipe.updatedAt.toISOString().slice(0, 10)).toBe('2026-11-13');
  });

  it('AC3: keeps waitDays when given', () => {
    const record = recipeSchema.parse(rawRecipeRecord({ waitDays: 21 }));
    expect(toRecipe('kiselo-zele', record).waitDays).toBe(21);
  });

  const rejected: ReadonlyArray<[string, Record<string, unknown>]> = [
    ['an unknown key', { reviewStatus: 'draft' }],
    ['a summary under 70 characters', { summary: SUMMARY_TOO_SHORT }],
    ['a summary over 160 characters', { summary: SUMMARY_TOO_LONG }],
    ['an unknown category', { category: 'soup' }],
    ['an unknown unit', { ingredients: [{ name: 'Круши', quantity: 1, unit: 'oz' }] }],
    ['an empty produce list', { produce: [] }],
    ['a duplicate produce', { produce: ['krushi', 'krushi'] }],
    ['a produce that is not a slug', { produce: ['Круши'] }],
    ['a negative minute', { prepMinutes: -1 }],
    ['a fractional minute', { cookMinutes: 1.5 }],
    ['a non-positive quantity', { ingredients: [{ name: 'Круши', quantity: 0, unit: 'kg' }] }],
    ['no ingredient', { ingredients: [] }],
    ['no step', { steps: [] }],
    ['a multi-line step', { steps: ['Измий.\nНарежи.'] }],
    ['an http source', { sources: [{ name: 'X', url: 'http://www.bgfermer.bg/Article/1' }] }],
    ['no recipe source', { sources: [] }],
    [
      'no safety source',
      {
        safety: {
          note: 'Бележка.',
          sterilisation: 'Стерилизация.',
          storage: 'Съхранение.',
          sources: [],
        },
      },
    ],
    [
      'a safety block without a storage note',
      {
        safety: {
          note: 'Бележка.',
          sterilisation: 'Стерилизация.',
          sources: [{ name: 'X', url: 'https://nchfp.uga.edu/' }],
        },
      },
    ],
    ['updatedAt before publishedAt', { publishedAt: '2026-11-13', updatedAt: '2026-11-12' }],
  ];

  it.each(rejected)('AC3: rejects %s', (_label, overrides) => {
    expect(recipeSchema.safeParse(rawRecipeRecord(overrides)).success).toBe(false);
  });
});
