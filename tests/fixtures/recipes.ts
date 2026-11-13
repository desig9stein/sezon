import type { Recipe, RecipeInput } from '@contexts/recipes';
import { Recipe as RecipeEntity } from '@contexts/recipes';

const SAFETY_SOURCE = {
  name: 'National Center for Home Food Preservation – Pears-Halved',
  url: 'https://nchfp.uga.edu/how/can/canning-fruits-and-fruit-products/pears-halved/',
} as const;

const RECIPE_SOURCE = {
  name: 'Български фермер – Най-вкусните компоти за зимата',
  url: 'https://www.bgfermer.bg/Article/23461966',
} as const;

/** Returns valid {@link RecipeInput}; `overrides` replace top-level fields. */
export function recipeInput(overrides: Partial<RecipeInput> = {}): RecipeInput {
  return {
    slug: 'kompot-ot-krushi',
    name: 'Компот от круши',
    summary:
      'Компот от круши за зимата: половинки круши в лек сироп, стерилизирани във водна баня според размера на буркана.',
    category: 'compote',
    produceSlugs: ['krushi'],
    yield: 'от 10 круши',
    prepMinutes: 30,
    cookMinutes: 10,
    processingMinutes: 25,
    waitDays: 0,
    ingredients: [
      { name: 'Круши', quantity: 10, unit: 'piece' },
      { name: 'Захар', quantity: 1, unit: 'cup' },
    ],
    steps: ['Измий и обели крушите.', 'Вари ги 5 минути в сиропа.'],
    safety: {
      note: 'Пълни бурканите горещи.',
      sterilisation: 'Вари бурканите 25 минути във вряща водна баня.',
      storage: 'Пази бурканите на хладно и тъмно място.',
      sources: [SAFETY_SOURCE],
    },
    sources: [RECIPE_SOURCE],
    publishedAt: new Date('2026-11-13'),
    updatedAt: new Date('2026-11-13'),
    ...overrides,
  };
}

/** Builds a valid {@link Recipe}; `overrides` replace top-level input fields. */
export function aRecipe(overrides: Partial<RecipeInput> = {}): Recipe {
  return RecipeEntity.create(recipeInput(overrides));
}

/** Returns a raw recipe entry as YAML would give it; `overrides` replace top-level fields. */
export function rawRecipeRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: 'Компот от круши',
    summary:
      'Компот от круши за зимата: половинки круши в лек сироп, стерилизирани във водна баня според размера на буркана.',
    category: 'compote',
    produce: ['krushi'],
    yield: 'от 10 круши',
    prepMinutes: 30,
    cookMinutes: 10,
    processingMinutes: 25,
    ingredients: [
      { name: 'Круши', quantity: 10, unit: 'piece' },
      { name: 'Захар', quantity: 1, unit: 'cup' },
    ],
    steps: ['Измий и обели крушите.', 'Вари ги 5 минути в сиропа.'],
    safety: {
      note: 'Пълни бурканите горещи.',
      sterilisation: 'Вари бурканите 25 минути във вряща водна баня.',
      storage: 'Пази бурканите на хладно и тъмно място.',
      sources: [{ ...SAFETY_SOURCE }],
    },
    sources: [{ ...RECIPE_SOURCE }],
    publishedAt: '2026-11-13',
    updatedAt: '2026-11-13',
    ...overrides,
  };
}
