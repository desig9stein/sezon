import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import type { Recipe } from '../domain/Recipe';
import type { RecipeRepository } from '../domain/repositories';

/** {@link RecipeRepository} over an asynchronously loaded list of recipes. */
export class IndexedRecipeRepository extends IndexedRepository<Recipe> implements RecipeRepository {
  /** Returns the recipes that use `produceSlug`, sorted by Bulgarian name. */
  async findByProduce(produceSlug: string): Promise<ReadonlyArray<Recipe>> {
    return Object.freeze((await this.all()).filter((recipe) => recipe.uses(produceSlug)));
  }
}
