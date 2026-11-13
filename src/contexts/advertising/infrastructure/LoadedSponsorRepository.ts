import { cachedLoad } from '@shared/infrastructure/cachedLoad';
import type { SponsorRepository } from '../domain/repositories';
import type { Sponsor } from '../domain/Sponsor';

/**
 * {@link SponsorRepository} over an asynchronously loaded list of sponsors. A successful load is
 * cached; a failed load is retried on the next call.
 */
export class LoadedSponsorRepository implements SponsorRepository {
  private readonly sponsors: () => Promise<ReadonlyArray<Sponsor>>;

  /** @param load - Returns the sponsors. */
  constructor(load: () => Promise<ReadonlyArray<Sponsor>>) {
    this.sponsors = cachedLoad(async () => Object.freeze([...(await load())]));
  }

  /** Returns every sponsor, in load order. */
  all(): Promise<ReadonlyArray<Sponsor>> {
    return this.sponsors();
  }
}
