import { z } from 'astro/zod';
import {
  bulgarianPhone,
  email,
  httpsUrl,
  isoDate,
  slugReference,
  text,
  uniqueBy,
} from '@shared/infrastructure/schemaPrimitives';
import { CONTACT_REQUIRED_MESSAGE } from '../domain/ContactInfo';

/** Schema of a `farms` content entry. */
export const farmSchema = z.strictObject({
  name: text(),
  region: slugReference(),
  produce: z
    .array(slugReference())
    .min(1)
    .superRefine(uniqueBy((slug) => slug, 'produce')),
  description: text(),
  contact: z
    .strictObject({
      website: httpsUrl().optional(),
      email: email().optional(),
      phone: bulgarianPhone().optional(),
    })
    .refine((contact) => Object.values(contact).some((value) => value !== undefined), {
      message: CONTACT_REQUIRED_MESSAGE,
    }),
  address: text().optional(),
  isPlaceholder: z.boolean(),
  sponsored: z.boolean().default(false),
  organic: z
    .strictObject({ certifier: text(), certificateId: text(), validUntil: isoDate() })
    .optional(),
});

export type FarmRecord = z.infer<typeof farmSchema>;
