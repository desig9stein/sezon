import type { Sponsor } from './Sponsor';

/** Read access to sponsors. */
export interface SponsorRepository {
  /** Returns every sponsor, in no particular order. */
  all(): Promise<ReadonlyArray<Sponsor>>;
}
