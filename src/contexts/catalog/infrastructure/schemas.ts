import { z } from 'astro/zod';
import {
  isoDate,
  singleLineText,
  slugReference,
  sourceSchema,
  text,
  uniqueBy,
} from '@shared/infrastructure/schemaPrimitives';
import { FIRST_MONTH_NUMBER, LAST_MONTH_NUMBER, SEASON_LEVEL_VALUES } from '@contexts/seasonality';
import { NUTRIENT_KINDS, NUTRIENT_UNITS } from '../domain/Nutrient';
import { REVIEW_STATUSES, TRADITIONAL_SYSTEMS } from '../domain/Produce';
import { PRODUCE_KINDS } from '../domain/ProduceKind';

const SUMMARY_MIN_LENGTH = 70;
const SUMMARY_MAX_LENGTH = 160;
/** Required opening of every traditional-use statement. */
export const TRADITIONAL_USE_PREFIX = 'Традиционно се използва';
const TRADITIONAL_USE_PATTERN = new RegExp(`^${TRADITIONAL_USE_PREFIX}(?:\\s|$)`);

const amount = () => z.number().nonnegative();

const nutritionSchema = z
  .strictObject({
    energyKcal: amount(),
    proteinG: amount(),
    fatG: amount(),
    carbohydrateG: amount(),
    fiberG: amount(),
    sugarsG: amount().optional(),
    micronutrients: z
      .array(z.strictObject({ nutrient: slugReference(), amount: amount() }))
      .superRefine(uniqueBy((item) => item.nutrient, 'nutrient')),
    source: sourceSchema,
  })
  .refine((nutrition) => (nutrition.sugarsG ?? 0) <= nutrition.carbohydrateG, {
    message: 'sugarsG must not exceed carbohydrateG.',
    path: ['sugarsG'],
  });

/** Schema of a `produce` content entry. */
export const produceSchema = z.strictObject({
  name: text(),
  latinName: text(),
  kind: z.enum(PRODUCE_KINDS),
  group: slugReference(),
  summary: singleLineText().min(SUMMARY_MIN_LENGTH).max(SUMMARY_MAX_LENGTH),
  varieties: z
    .array(z.strictObject({ name: text(), note: text().optional() }))
    .superRefine(uniqueBy((variety) => variety.name, 'variety')),
  season: z
    .array(
      z.strictObject({
        month: z.number().int().min(FIRST_MONTH_NUMBER).max(LAST_MONTH_NUMBER),
        level: z.enum(SEASON_LEVEL_VALUES),
      }),
    )
    .min(1)
    .superRefine(uniqueBy((entry) => entry.month, 'season month')),
  regions: z
    .array(z.strictObject({ region: slugReference(), note: text() }))
    .min(1)
    .superRefine(uniqueBy((entry) => entry.region, 'region')),
  nutrition: nutritionSchema,
  preparation: z.array(z.strictObject({ method: text(), tip: text() })).min(1),
  traditionalUses: z.array(
    z.strictObject({
      system: z.enum(TRADITIONAL_SYSTEMS),
      use: text().regex(TRADITIONAL_USE_PATTERN, `Must start with „${TRADITIONAL_USE_PREFIX}“.`),
      source: sourceSchema,
    }),
  ),
  howToChoose: text(),
  storage: text(),
  faq: z.array(z.strictObject({ question: text(), answer: text() })),
  updatedAt: isoDate(),
  reviewStatus: z.enum(REVIEW_STATUSES),
});

/** Schema of a `groups` content entry. */
export const groupSchema = z.strictObject({
  name: text(),
  latinName: text(),
  description: text(),
});

/** Schema of a `nutrients` content entry. */
export const nutrientSchema = z.strictObject({
  name: text(),
  kind: z.enum(NUTRIENT_KINDS),
  unit: z.enum(NUTRIENT_UNITS),
  referenceIntake: z.number().positive(),
  claims: z
    .array(text().refine((claim) => !claim.endsWith('.'), 'Claims are stored without a full stop.'))
    .min(1),
  claimsSource: sourceSchema,
  note: text().optional(),
});

export type ProduceRecord = z.infer<typeof produceSchema>;
export type GroupRecord = z.infer<typeof groupSchema>;
export type NutrientRecord = z.infer<typeof nutrientSchema>;
