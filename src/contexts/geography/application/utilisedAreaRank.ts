import type { Region } from '../domain/Region';

/** A region's place in a ranking: `rank` 1 is the largest, among `total` ranked regions. */
export interface AreaRank {
  readonly rank: number;
  readonly total: number;
}

/**
 * Ranks the utilised agricultural area of the region with `slug` among the regions that have a
 * profile. Regions with equal areas share a rank.
 * @returns The rank, or `undefined` when the region is unknown or has no profile.
 */
export function utilisedAreaRank(
  regions: ReadonlyArray<Region>,
  slug: string,
): AreaRank | undefined {
  const area = regions.find((region) => region.slug === slug)?.profile?.utilisedAreaHa;
  if (area === undefined) return undefined;
  const areas = regions.flatMap((region) =>
    region.profile === undefined ? [] : [region.profile.utilisedAreaHa],
  );
  return Object.freeze({
    rank: 1 + areas.filter((other) => other > area).length,
    total: areas.length,
  });
}
