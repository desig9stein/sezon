import { z } from 'astro/zod';
import {
  httpsUrl,
  isoDate,
  singleLineText,
  type ImageSchemaFactory,
} from '@shared/infrastructure/schemaPrimitives';
import { AD_PLACEMENTS } from '../domain/AdPlacement';

/**
 * Schema of a `sponsors` content entry: a banner image, its alternative text, the sponsor's URL,
 * the placement and the first and last campaign day (`from` must not be after `to`).
 * @param context - Provides the image schema factory (Astro's `SchemaContext`).
 */
export const sponsorSchemaWith = ({ image }: { image: ImageSchemaFactory }) =>
  z
    .strictObject({
      name: singleLineText(),
      image: image(),
      alt: singleLineText(),
      url: httpsUrl(),
      placement: z.enum(AD_PLACEMENTS),
      from: isoDate(),
      to: isoDate(),
    })
    .refine((record) => record.from.getTime() <= record.to.getTime(), {
      message: 'A sponsor campaign must not end before it starts.',
      path: ['to'],
    });

export type SponsorRecord = z.infer<ReturnType<typeof sponsorSchemaWith>>;
