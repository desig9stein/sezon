import { z } from 'astro/zod';
import {
  isoDate,
  singleLineText,
  slugReference,
  sourceSchema,
  uniqueBy,
} from '@shared/infrastructure/schemaPrimitives';
import { DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH } from '@shared/seo';
import { INGREDIENT_UNITS } from '../domain/IngredientUnit';
import { RECIPE_CATEGORIES } from '../domain/RecipeCategory';

/** A whole number of minutes or days, zero or more. */
const wholeCount = () => z.number().int().nonnegative();

/** Schema of a `recipes` content entry; `updatedAt` must not be before `publishedAt`. */
export const recipeSchema = z
  .strictObject({
    title: singleLineText(),
    summary: singleLineText().min(DESCRIPTION_MIN_LENGTH).max(DESCRIPTION_MAX_LENGTH),
    category: z.enum(RECIPE_CATEGORIES),
    produce: z
      .array(slugReference())
      .min(1)
      .superRefine(uniqueBy((slug) => slug, 'produce')),
    yield: singleLineText(),
    prepMinutes: wholeCount().optional(),
    cookMinutes: wholeCount().optional(),
    processingMinutes: wholeCount(),
    waitDays: wholeCount().default(0),
    ingredients: z
      .array(
        z.strictObject({
          name: singleLineText(),
          quantity: z.number().positive(),
          unit: z.enum(INGREDIENT_UNITS),
        }),
      )
      .min(1),
    steps: z.array(singleLineText()).min(1),
    safety: z.strictObject({
      note: singleLineText(),
      sterilisation: singleLineText(),
      storage: singleLineText(),
      sources: z.array(sourceSchema).min(1),
    }),
    sources: z.array(sourceSchema).min(1),
    publishedAt: isoDate(),
    updatedAt: isoDate(),
  })
  .refine((record) => record.updatedAt.getTime() >= record.publishedAt.getTime(), {
    message: 'A recipe must not be updated before it is published.',
    path: ['updatedAt'],
  });

export type RecipeRecord = z.infer<typeof recipeSchema>;
