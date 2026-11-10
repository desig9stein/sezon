import { z } from 'astro/zod';
import { httpsUrl, slugReference, text, uniqueBy } from '@shared/infrastructure/schemaPrimitives';

/** Schema of a `farms` content entry. */
export const farmSchema = z.object({
  name: text(),
  region: slugReference(),
  produce: z
    .array(slugReference())
    .min(1)
    .superRefine(uniqueBy((slug) => slug, 'produce')),
  description: text(),
  contact: z
    .object({
      website: httpsUrl().optional(),
      email: z.email().optional(),
      phone: z.e164().optional(),
    })
    .refine((contact) => Object.values(contact).some((value) => value !== undefined), {
      message: 'A farm needs a website, an email or a phone number.',
    }),
  address: text().optional(),
  isPlaceholder: z.boolean(),
  sponsored: z.boolean().default(false),
});

export type FarmRecord = z.infer<typeof farmSchema>;
