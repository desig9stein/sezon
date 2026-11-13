import type { SponsorRepository } from '../domain/repositories';
import type { Sponsor } from '../domain/Sponsor';

/**
 * {@link SponsorRepository} over an asynchronously loaded list of sponsors. A successful load is
 * cached; a failed load is retried on the next call.
 */
export class LoadedSponsorRepository implements SponsorRepository {
  private sponsors: Promise<ReadonlyArray<Sponsor>> | undefined;

  /** @param load - Returns the sponsors. */
  constructor(private readonly load: () => Promise<ReadonlyArray<Sponsor>>) {}

  /** Returns every sponsor, in load order. */
  all(): Promise<ReadonlyArray<Sponsor>> {
    this.sponsors ??= this.load()
      .then((sponsors) => Object.freeze([...sponsors]))
      .catch((error: unknown) => {
        this.sponsors = undefined;
        throw error;
      });
    return this.sponsors;
  }
}
