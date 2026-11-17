/**
 * Provinces that lie inside another province, by slug (spec 062): София-град is surrounded by
 * Софийска област, so a reader looking for farms near Sofia is pointed there too.
 */
const SURROUNDING_REGIONS: Readonly<Record<string, string>> = Object.freeze({
  'sofia-grad': 'sofiyska',
});

/**
 * Returns the slug of the province around the province `slug`, or `undefined` when none
 * surrounds it.
 * @param slug - Slug of a province.
 */
export function surroundingRegionSlug(slug: string): string | undefined {
  return Object.hasOwn(SURROUNDING_REGIONS, slug) ? SURROUNDING_REGIONS[slug] : undefined;
}
