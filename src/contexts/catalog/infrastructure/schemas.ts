import { z } from 'astro/zod';
import {
  httpsUrl,
  type ImageSchemaFactory,
  isoDate,
  singleLineText,
  slugReference,
  sourceSchema,
  text,
  uniqueBy,
} from '@shared/infrastructure/schemaPrimitives';
import { FIRST_MONTH_NUMBER, LAST_MONTH_NUMBER, SEASON_LEVEL_VALUES } from '@contexts/seasonality';
import { NUTRIENT_KINDS, NUTRIENT_UNITS } from '../domain/Nutrient';
import { TRADITIONAL_SYSTEMS } from '../domain/Produce';
import { PRODUCE_KINDS } from '../domain/ProduceKind';
import { ORGANIC_AVAILABILITIES } from '../domain/OrganicProduction';

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

/**
 * Schema of a `produce` content entry. Only the name, kind, group, summary, season and update date
 * are required (spec 049); omitted lists are parsed as empty, other omitted blocks stay undefined.
 */
export const produceSchema = z.strictObject({
  name: text(),
  latinName: text().optional(),
  kind: z.enum(PRODUCE_KINDS),
  group: slugReference(),
  summary: singleLineText().min(SUMMARY_MIN_LENGTH).max(SUMMARY_MAX_LENGTH),
  varieties: z
    .array(z.strictObject({ name: text(), note: text().optional() }))
    .superRefine(uniqueBy((variety) => variety.name, 'variety'))
    .default(() => []),
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
    .array(
      z.strictObject({ region: slugReference(), note: text(), source: sourceSchema.optional() }),
    )
    .superRefine(uniqueBy((entry) => entry.region, 'region'))
    .default(() => []),
  nutrition: nutritionSchema.optional(),
  preparation: z.array(z.strictObject({ method: text(), tip: text() })).default(() => []),
  traditionalUses: z
    .array(
      z.strictObject({
        system: z.enum(TRADITIONAL_SYSTEMS),
        use: text().regex(TRADITIONAL_USE_PATTERN, `Must start with „${TRADITIONAL_USE_PREFIX}“.`),
        source: sourceSchema,
      }),
    )
    .default(() => []),
  howToChoose: text().optional(),
  storage: text().optional(),
  faq: z.array(z.strictObject({ question: text(), answer: text() })).default(() => []),
  updatedAt: isoDate(),
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

const TIPS_MIN = 3;
const TIPS_MAX = 5;
const TIP_MAX_LENGTH = 140;
const monthNumber = () => z.number().int().min(FIRST_MONTH_NUMBER).max(LAST_MONTH_NUMBER);
const monthList = () => z.array(monthNumber()).superRefine(uniqueBy((month) => month, 'month'));

/** Schema of a produce's home-garden guide: month windows, an optional note, tips and sources. */
export const growingSchema = z
  .strictObject({
    sow: monthList(),
    transplant: monthList(),
    plant: monthList(),
    plantingNote: singleLineText().optional(),
    tips: z.array(singleLineText().max(TIP_MAX_LENGTH)).min(TIPS_MIN).max(TIPS_MAX),
    sources: z.array(sourceSchema).min(1),
  })
  .refine(
    (growing) =>
      growing.sow.length + growing.transplant.length + growing.plant.length > 0 ||
      growing.plantingNote !== undefined,
    { message: 'A growing guide needs a month or a planting note.' },
  );

const ORGANIC_NOTE_MAX_LENGTH = 160;

/** Schema of a produce's organic production in Bulgaria: availability, a note and sources. */
export const organicSchema = z.strictObject({
  availability: z.enum(ORGANIC_AVAILABILITIES),
  note: singleLineText().max(ORGANIC_NOTE_MAX_LENGTH),
  sources: z.array(sourceSchema).min(1),
});

export type { ImageSchemaFactory };

/**
 * Schema of a produce photo: a local image, its Bulgarian alternative text and its credit.
 * @param image - Factory of the image schema, e.g. Astro's `image()` helper.
 */
export const photoSchema = (image: ImageSchemaFactory) =>
  z.strictObject({
    src: image(),
    alt: singleLineText(),
    credit: z.strictObject({
      author: text(),
      authorUrl: httpsUrl(),
      sourceName: text(),
      sourceUrl: httpsUrl(),
    }),
  });

/**
 * Schema of a `produce` content entry including its optional photo.
 * @param context - Provides the image schema factory (Astro's `SchemaContext`).
 */
export const produceSchemaWith = ({ image }: { image: ImageSchemaFactory }) =>
  produceSchema.extend({
    photo: photoSchema(image).optional(),
    growing: growingSchema.optional(),
    organic: organicSchema.optional(),
  });

export type ProduceRecord = z.infer<ReturnType<typeof produceSchemaWith>>;
export type GroupRecord = z.infer<typeof groupSchema>;
export type NutrientRecord = z.infer<typeof nutrientSchema>;
