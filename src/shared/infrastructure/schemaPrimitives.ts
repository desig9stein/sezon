import { z } from 'astro/zod';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTPS_PROTOCOL = /^https$/;

/** A non-empty string with surrounding whitespace removed. */
export const text = () => z.string().trim().min(1);

/** A slug referencing another content entry by id. */
export const slugReference = () =>
  z.string().regex(SLUG_PATTERN, 'Expected a lowercase Latin slug.');

/** An absolute `https:` URL. */
export const httpsUrl = () => z.url({ protocol: HTTPS_PROTOCOL });

/** A citation with a name and an https URL. */
export const sourceSchema = z.object({ name: text(), url: httpsUrl() });

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
