import { Sponsor } from '../domain/Sponsor';
import type { SponsorRecord } from './schemas';

/** Maps a validated `sponsors` record to a {@link Sponsor}. @throws InvalidSponsorError */
export function toSponsor(id: string, record: SponsorRecord): Sponsor {
  return Sponsor.create({
    id,
    name: record.name,
    image: record.image,
    alt: record.alt,
    url: record.url,
    placement: record.placement,
    from: record.from,
    to: record.to,
  });
}
