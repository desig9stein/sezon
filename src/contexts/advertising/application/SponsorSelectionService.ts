import type { AdPlacement } from '../domain/AdPlacement';
import type { SponsorRepository } from '../domain/repositories';
import type { Sponsor } from '../domain/Sponsor';

/** Orders sponsors by the latest start first, then by the lowest id. */
function byPriority(a: Sponsor, b: Sponsor): number {
  const byStart = b.from.getTime() - a.from.getTime();
  if (byStart !== 0) return byStart;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/** Chooses the sponsor to show in an ad slot. */
export class SponsorSelectionService {
  constructor(private readonly sponsors: SponsorRepository) {}

  /**
   * Returns the sponsor active on `on` for `placement`, or `undefined` when there is none. When
   * several are active, returns the one with the latest `from`, then the lowest `id`.
   */
  async forPlacement(placement: AdPlacement, on: Date): Promise<Sponsor | undefined> {
    const active = (await this.sponsors.all()).filter(
      (sponsor) => sponsor.placement === placement && sponsor.isActiveOn(on),
    );
    return [...active].sort(byPriority)[0];
  }
}
