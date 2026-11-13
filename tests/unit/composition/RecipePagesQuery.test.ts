import { describe, expect, it } from 'vitest';
import { RecipePagesQuery } from '@composition/RecipePagesQuery';
import { RecipeIndexService } from '@contexts/recipes';
import { IndexedRecipeRepository } from '@contexts/recipes/infrastructure/IndexedRecipeRepository';
import { BrokenReferenceError, RecipeNotFoundError } from '@shared/domain/errors';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { aRecipe } from '@tests/fixtures/recipes';

const produce = produceRepositoryOf([
  aProduce({
    slug: 'yabalki',
    name: 'Ябълки',
    kind: 'fruit',
    season: [{ month: 9, level: 'peak' }],
  }),
  aProduce({ slug: 'krushi', name: 'Круши', kind: 'fruit', season: [{ month: 9, level: 'peak' }] }),
]);

const queryWith = (recipes: ReturnType<typeof aRecipe>[]) => {
  const repository = new IndexedRecipeRepository(async () => recipes);
  return new RecipePagesQuery({
    recipes: repository,
    index: new RecipeIndexService(repository),
    produce,
  });
};

describe('RecipePagesQuery (spec 048)', () => {
  it('AC5: returns the recipe and its produce in the recipe order', async () => {
    const query = queryWith([aRecipe({ produceSlugs: ['yabalki', 'krushi'] })]);
    const page = await query.forSlug('kompot-ot-krushi');
    expect(page.recipe.name).toBe('Компот от круши');
    expect(page.produce.map(({ slug }) => slug)).toEqual(['yabalki', 'krushi']);
  });

  it('AC5: throws RecipeNotFoundError for an unknown slug', async () => {
    await expect(queryWith([aRecipe()]).forSlug('missing')).rejects.toThrow(RecipeNotFoundError);
  });

  it('AC5: throws BrokenReferenceError for an unknown produce', async () => {
    const query = queryWith([aRecipe({ produceSlugs: ['krushi', 'dyuli'] })]);
    await expect(query.forSlug('kompot-ot-krushi')).rejects.toThrow(BrokenReferenceError);
  });

  it('AC5: the overview resolves the produce of every recipe by category', async () => {
    const query = queryWith([
      aRecipe(),
      aRecipe({
        slug: 'sladko-ot-yabalki',
        name: 'Сладко от ябълки',
        category: 'preserve',
        produceSlugs: ['yabalki'],
      }),
    ]);
    const overview = await query.overview();
    expect(overview.map(({ category }) => category)).toEqual(['preserve', 'compote']);
    expect(overview[0]?.recipes[0]?.produce.map(({ name }) => name)).toEqual(['Ябълки']);
    expect(overview[1]?.recipes[0]?.recipe.slug).toBe('kompot-ot-krushi');
  });
});
