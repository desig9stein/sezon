import { Slug } from '@shared/domain/Slug';
import { ContactInfo } from '../domain/ContactInfo';
import { Farm } from '../domain/Farm';
import type { FarmRecord } from './schemas';

/** Maps a validated `farms` record to a {@link Farm}. @throws InvalidSlugError | InvalidContactInfoError */
export function toFarm(id: string, record: FarmRecord): Farm {
  return Farm.create({
    slug: Slug.parse(id).value,
    name: record.name,
    regionSlug: record.region,
    produceSlugs: record.produce,
    description: record.description,
    contact: ContactInfo.create(record.contact),
    address: record.address,
    sponsored: record.sponsored,
    organic: record.organic,
    sources: record.sources,
  });
}
