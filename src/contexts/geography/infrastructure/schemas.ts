import { z } from 'astro/zod';
import { text } from '@shared/infrastructure/schemaPrimitives';

/** Schema of a `regions` content entry. */
export const regionSchema = z.object({
  name: text(),
});

export type RegionRecord = z.infer<typeof regionSchema>;
