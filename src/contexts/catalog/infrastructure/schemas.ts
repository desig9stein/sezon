import { z } from 'astro/zod';
import {
  slugReference,
  sourceSchema,
  text,
  uniqueBy,
} from '@shared/infrastructure/schemaPrimitives';
import { SEASON_LEVEL_VALUES } from '@contexts/seasonality';
import { NUTRIENT_KINDS, NUTRIENT_UNITS } from '../domain/Nutrient';
import { REVIEW_STATUSES, TRADITIONAL_SYSTEMS } from '../domain/Produce';
import { PRODUCE_KINDS } from '../domain/ProduceKind';

const SUMMARY_MIN_LENGTH = 70;
const SUMMARY_MAX_LENGTH = 160;
const FIRST_MONTH = 1;
const LAST_MONTH = 12;
/** Required opening of every traditional-use statement. */
export const TRADITIONAL_USE_PREFIX = 'Традиционно се използва';

const amount = () => z.number().finite().nonnegative();

const nutritionSchema = z.object({
  energyKcal: amount(),
  proteinG: amount(),
  fatG: amount(),
  carbohydrateG: amount(),
  fiberG: amount(),
  sugarsG: amount().optional(),
  micronutrients: z
    .array(z.object({ nutrient: slugReference(), amount: amount() }))
    .superRefine(uniqueBy((item) => item.nutrient, 'nutrient')),
  source: sourceSchema,
});

/** Schema of a `produce` content entry. */
export const produceSchema = z.object({
  name: text(),
  latinName: text(),
  kind: z.enum(PRODUCE_KINDS),
  group: slugReference(),
  summary: text().min(SUMMARY_MIN_LENGTH).max(SUMMARY_MAX_LENGTH),
  varieties: z
    .array(z.object({ name: text(), note: text().optional() }))
    .superRefine(uniqueBy((variety) => variety.name, 'variety')),
  season: z
    .array(
      z.object({
        month: z.number().int().min(FIRST_MONTH).max(LAST_MONTH),
        level: z.enum(SEASON_LEVEL_VALUES),
      }),
    )
    .min(1)
    .superRefine(uniqueBy((entry) => entry.month, 'season month')),
  regions: z
    .array(z.object({ region: slugReference(), note: text() }))
    .min(1)
    .superRefine(uniqueBy((entry) => entry.region, 'region')),
  nutrition: nutritionSchema,
  preparation: z.array(z.object({ method: text(), tip: text() })).min(1),
  traditionalUses: z.array(
    z.object({
      system: z.enum(TRADITIONAL_SYSTEMS),
      use: text().startsWith(TRADITIONAL_USE_PREFIX),
      source: sourceSchema,
    }),
  ),
  howToChoose: text(),
  storage: text(),
  faq: z.array(z.object({ question: text(), answer: text() })),
  updatedAt: z.coerce.date(),
  reviewStatus: z.enum(REVIEW_STATUSES),
});

/** Schema of a `groups` content entry. */
export const groupSchema = z.object({
  name: text(),
  latinName: text(),
  description: text(),
});

/** Schema of a `nutrients` content entry. */
export const nutrientSchema = z.object({
  name: text(),
  kind: z.enum(NUTRIENT_KINDS),
  unit: z.enum(NUTRIENT_UNITS),
  referenceIntake: z.number().positive(),
  description: text(),
});

export type ProduceRecord = z.infer<typeof produceSchema>;
export type GroupRecord = z.infer<typeof groupSchema>;
export type NutrientRecord = z.infer<typeof nutrientSchema>;
