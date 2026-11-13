import type { Produce, ProduceRepository } from '@contexts/catalog';
import type {
  Recipe,
  RecipeCategory,
  RecipeIndexService,
  RecipeRepository,
} from '@contexts/recipes';
import { BrokenReferenceError, RecipeNotFoundError } from '@shared/domain/errors';

/** A recipe with the produce it uses, in the recipe's order. */
export interface RecipeWithProduce {
  readonly recipe: Recipe;
  readonly produce: ReadonlyArray<Produce>;
}

/** The recipes of one category, each with its produce. */
export interface RecipeOverviewGroup {
  readonly category: RecipeCategory;
  readonly recipes: ReadonlyArray<RecipeWithProduce>;
}

/** Repositories and services the query reads from. */
export interface RecipePagesSources {
  readonly recipes: RecipeRepository;
  readonly index: RecipeIndexService;
  readonly produce: ProduceRepository;
}

/** Read model for the recipe index and the recipe pages, across recipes and catalog. */
export class RecipePagesQuery {
  constructor(private readonly sources: RecipePagesSources) {}

  /**
   * Returns the recipe with `slug` and its produce.
   * @throws RecipeNotFoundError when no recipe has that slug.
   * @throws BrokenReferenceError when the recipe uses a produce that does not exist.
   */
  async forSlug(slug: string): Promise<RecipeWithProduce> {
    const recipe = await this.sources.recipes.findBySlug(slug);
    if (recipe === undefined) throw new RecipeNotFoundError(`No recipe with slug "${slug}".`);
    return this.withProduce(recipe);
  }

  /**
   * Returns the categories that have recipes, each recipe with its produce.
   * @throws BrokenReferenceError when a recipe uses a produce that does not exist.
   */
  async overview(): Promise<ReadonlyArray<RecipeOverviewGroup>> {
    const groups = await this.sources.index.byCategory();
    return Object.freeze(
      await Promise.all(
        groups.map(async ({ category, recipes }) =>
          Object.freeze({
            category,
            recipes: Object.freeze(
              await Promise.all(recipes.map((recipe) => this.withProduce(recipe))),
            ),
          }),
        ),
      ),
    );
  }

  private async withProduce(recipe: Recipe): Promise<RecipeWithProduce> {
    const produce = await Promise.all(
      recipe.produceSlugs.map(async (produceSlug) => {
        const item = await this.sources.produce.findBySlug(produceSlug);
        if (item === undefined) {
          throw new BrokenReferenceError(`recipes/${recipe.slug} → produce/${produceSlug}`);
        }
        return item;
      }),
    );
    return Object.freeze({ recipe, produce: Object.freeze(produce) });
  }
}
