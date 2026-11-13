import { z } from 'astro/zod';
import { BULGARIAN_PHONE, EMAIL, isHttpsUrl } from '@shared/domain/contact';
import type { ImageAsset } from '@shared/domain/ImageAsset';
import { SLUG_PATTERN } from '@shared/domain/Slug';

const ISO_DATE_MESSAGE = 'Expected an ISO date (YYYY-MM-DD).';

/** A non-empty string with surrounding whitespace removed. */
export const text = () => z.string().trim().min(1);

/** A non-empty single-line string. */
export const singleLineText = () => text().regex(/^[^\r\n]*$/, 'Expected a single line.');

/** A slug referencing another content entry by id. */
export const slugReference = () =>
  z.string().regex(SLUG_PATTERN, 'Expected a lowercase Latin slug.');

/** An absolute `https:` URL with a dotted hostname. */
export const httpsUrl = () =>
  z.string().refine(isHttpsUrl, 'Expected an https URL with a domain name.');

/** An email address. */
export const email = () => z.string().regex(EMAIL, 'Expected an email address.');

/** A Bulgarian phone number in E.164 form (`+359…`). */
export const bulgarianPhone = () =>
  z.string().regex(BULGARIAN_PHONE, 'Expected a Bulgarian phone number such as +359888123456.');

/** A calendar date given as a YAML timestamp or an ISO `YYYY-MM-DD` string. */
export const isoDate = () =>
  z.union([z.date(), z.iso.date(ISO_DATE_MESSAGE).transform((value) => new Date(value))]);

/** Builds the schema of a local image: Astro's `image()` helper in the build, a stub in tests. */
export type ImageSchemaFactory = () => z.ZodType<ImageAsset>;

/** A citation with a name and an https URL. */
export const sourceSchema = z.strictObject({ name: text(), url: httpsUrl() });

/** Adds an issue for every value of `key(item)` that appears more than once in `items`. */
export function uniqueBy<T>(key: (item: T) => unknown, label: string) {
  return (items: ReadonlyArray<T>, ctx: z.RefinementCtx) => {
    const seen = new Set<unknown>();
    items.forEach((item, index) => {
      const value = key(item);
      if (seen.has(value)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate ${label} "${String(value)}".`,
          path: [index],
        });
      }
      seen.add(value);
    });
  };
}
