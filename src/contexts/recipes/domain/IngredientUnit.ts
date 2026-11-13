/** Units an ingredient quantity can be given in. */
export const INGREDIENT_UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tsp', 'tbsp', 'cup'] as const;

export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];

/** Returns `true` when `value` is one of {@link INGREDIENT_UNITS}. */
export function isIngredientUnit(value: string): value is IngredientUnit {
  return (INGREDIENT_UNITS as ReadonlyArray<string>).includes(value);
}
