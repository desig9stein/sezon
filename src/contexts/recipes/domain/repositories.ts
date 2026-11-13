import type { Repository } from '@shared/domain/Repository';
import type { Recipe } from './Recipe';

/** Read access to recipes. */
export interface RecipeRepository extends Repository<Recipe> {
  /** Returns the recipes that use `produceSlug`, sorted by Bulgarian name. */
  findByProduce(produceSlug: string): Promise<ReadonlyArray<Recipe>>;
}
