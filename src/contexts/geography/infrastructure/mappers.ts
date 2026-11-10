import { Slug } from '@shared/domain/Slug';
import { Region } from '../domain/Region';
import type { RegionRecord } from './schemas';

/** Maps a validated `regions` record to a {@link Region}. @throws InvalidSlugError */
export function toRegion(id: string, record: RegionRecord): Region {
  return Region.create({ slug: Slug.parse(id).value, name: record.name });
}
