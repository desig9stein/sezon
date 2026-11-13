import { z } from 'astro/zod';
import { sourceSchema, text } from '@shared/infrastructure/schemaPrimitives';
import { MAX_TOP_FRUITS } from '../domain/RegionProfile';

const hectares = () => z.number().positive();
const surveyYear = () => z.number().int().positive();

/** Schema of a province's agricultural profile (spec 038). */
export const regionProfileSchema = z.strictObject({
  utilisedAreaHa: hectares(),
  arableHa: hectares(),
  grasslandHa: hectares(),
  areaYear: surveyYear(),
  topFruits: z
    .array(z.strictObject({ name: text(), areaHa: hectares() }))
    .max(MAX_TOP_FRUITS)
    .optional(),
  orchardYear: surveyYear().optional(),
  sources: z.array(sourceSchema).min(1),
});

/** Schema of a `regions` content entry. */
export const regionSchema = z.strictObject({
  name: text(),
  profile: regionProfileSchema.optional(),
});

export type RegionProfileRecord = z.infer<typeof regionProfileSchema>;
export type RegionRecord = z.infer<typeof regionSchema>;
