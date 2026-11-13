import { Slug } from '@shared/domain/Slug';
import { Recipe } from '../domain/Recipe';
import type { RecipeRecord } from './schemas';

/** Maps a validated `recipes` record to a {@link Recipe}. @throws InvalidSlugError | InvalidRecipeError */
export function toRecipe(id: string, record: RecipeRecord): Recipe {
  return Recipe.create({
    slug: Slug.parse(id).value,
    name: record.title,
    summary: record.summary,
    category: record.category,
    produceSlugs: record.produce,
    yield: record.yield,
    prepMinutes: record.prepMinutes,
    cookMinutes: record.cookMinutes,
    processingMinutes: record.processingMinutes,
    waitDays: record.waitDays,
    ingredients: record.ingredients,
    steps: record.steps,
    safety: record.safety,
    sources: record.sources,
    publishedAt: record.publishedAt,
    updatedAt: record.updatedAt,
  });
}
