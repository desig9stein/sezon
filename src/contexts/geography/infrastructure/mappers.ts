import { Slug } from '@shared/domain/Slug';
import { Region } from '../domain/Region';
import { RegionProfile } from '../domain/RegionProfile';
import type { RegionRecord } from './schemas';

/**
 * Maps a validated `regions` record to a {@link Region}.
 * @throws InvalidSlugError
 * @throws InvalidRegionProfileError when the profile breaks an invariant.
 */
export function toRegion(id: string, record: RegionRecord): Region {
  return Region.create({
    slug: Slug.parse(id).value,
    name: record.name,
    profile: record.profile === undefined ? undefined : RegionProfile.create(record.profile),
  });
}
