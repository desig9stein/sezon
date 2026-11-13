/** Kinds of winter preserves, in the order of the recipe index. */
export const RECIPE_CATEGORIES = [
  'sauerkraut',
  'pickle',
  'preserve',
  'jam',
  'compote',
  'jarred-vegetables',
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

/** Returns `true` when `value` is one of {@link RECIPE_CATEGORIES}. */
export function isRecipeCategory(value: string): value is RecipeCategory {
  return (RECIPE_CATEGORIES as ReadonlyArray<string>).includes(value);
}
