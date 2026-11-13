import { describe, expect, it } from 'vitest';
import { RecipeIndexService } from '@contexts/recipes';
import { IndexedRecipeRepository } from '@contexts/recipes/infrastructure/IndexedRecipeRepository';
import { aRecipe } from '@tests/fixtures/recipes';

const repository = new IndexedRecipeRepository(async () => [
  aRecipe({ slug: 'kompot-ot-slivi', name: 'Компот от сливи', produceSlugs: ['slivi'] }),
  aRecipe({
    slug: 'kiselo-zele',
    name: 'Кисело зеле',
    category: 'sauerkraut',
    produceSlugs: ['zele'],
  }),
  aRecipe({
    slug: 'sladko-ot-sini-slivi',
    name: 'Сладко от сини сливи',
    category: 'preserve',
    produceSlugs: ['slivi'],
  }),
  aRecipe({ slug: 'kompot-ot-krushi', name: 'Компот от круши', produceSlugs: ['krushi'] }),
]);
const service = new RecipeIndexService(repository);

describe('RecipeIndexService (spec 048)', () => {
  it('AC4: groups recipes by non-empty category in category order, names sorted', async () => {
    const groups = await service.byCategory();
    expect(groups.map(({ category }) => category)).toEqual(['sauerkraut', 'preserve', 'compote']);
    expect(groups[2]?.recipes.map(({ slug }) => slug)).toEqual([
      'kompot-ot-krushi',
      'kompot-ot-slivi',
    ]);
  });

  it('AC4: lists the recipes that use a produce, in name order', async () => {
    expect((await service.forProduce('slivi')).map(({ slug }) => slug)).toEqual([
      'kompot-ot-slivi',
      'sladko-ot-sini-slivi',
    ]);
  });

  it('AC4: lists no recipe for a produce without recipes', async () => {
    expect(await service.forProduce('kopar')).toEqual([]);
  });

  it('AC4: returns no group when there are no recipes', async () => {
    const empty = new RecipeIndexService(new IndexedRecipeRepository(async () => []));
    expect(await empty.byCategory()).toEqual([]);
  });
});
