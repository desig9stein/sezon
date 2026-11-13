import type { Recipe } from '../domain/Recipe';
import { RECIPE_CATEGORIES, type RecipeCategory } from '../domain/RecipeCategory';
import type { RecipeRepository } from '../domain/repositories';

/** The recipes of one category, in Bulgarian name order. */
export interface RecipeCategoryGroup {
  readonly category: RecipeCategory;
  readonly recipes: ReadonlyArray<Recipe>;
}

/** Lists recipes for the recipe index and the produce pages. */
export class RecipeIndexService {
  constructor(private readonly recipes: RecipeRepository) {}

  /** Returns the categories that have recipes, in {@link RECIPE_CATEGORIES} order. */
  async byCategory(): Promise<ReadonlyArray<RecipeCategoryGroup>> {
    const all = await this.recipes.all();
    return Object.freeze(
      RECIPE_CATEGORIES.map((category) =>
        Object.freeze({
          category,
          recipes: Object.freeze(all.filter((recipe) => recipe.category === category)),
        }),
      ).filter((group) => group.recipes.length > 0),
    );
  }

  /** Returns the recipes that use `produceSlug`, in Bulgarian name order; empty when none. */
  forProduce(produceSlug: string): Promise<ReadonlyArray<Recipe>> {
    return this.recipes.findByProduce(produceSlug);
  }
}
