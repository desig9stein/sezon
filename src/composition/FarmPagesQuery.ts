import type { Produce, ProduceRepository } from '@contexts/catalog';
import type { Farm, FarmRepository } from '@contexts/farms';
import type { Region, RegionRepository } from '@contexts/geography';
import { BrokenReferenceError, FarmNotFoundError } from '@shared/domain/errors';
import type { FarmWithRegion } from './ProduceDetailsQuery';

/** Everything a farm page shows. */
export interface FarmPage extends FarmWithRegion {
  /** The produce the farm sells, in Bulgarian name order. */
  readonly produce: ReadonlyArray<Produce>;
}

/** Repositories the query reads from. */
export interface FarmPagesRepositories {
  readonly farms: FarmRepository;
  readonly regions: RegionRepository;
  readonly produce: ProduceRepository;
}

/** Read model for the farm list and the farm pages, across farms, geography and catalog. */
export class FarmPagesQuery {
  constructor(private readonly repositories: FarmPagesRepositories) {}

  /**
   * Returns every farm in Bulgarian name order with its region and whether it is certified organic
   * on the day of `on`.
   * @throws BrokenReferenceError when a farm's region does not exist.
   */
  async all(on: Date): Promise<ReadonlyArray<FarmWithRegion>> {
    const farms = await this.repositories.farms.all();
    return Promise.all(farms.map((farm) => this.withRegion(farm, on)));
  }

  /**
   * Returns the farm with `slug`, its region, its organic status on the day of `on` and the
   * produce it sells.
   * @throws FarmNotFoundError when no farm has that slug.
   * @throws BrokenReferenceError when its region or one of its produce does not exist.
   */
  async forSlug(slug: string, on: Date): Promise<FarmPage> {
    const farm = await this.repositories.farms.findBySlug(slug);
    if (farm === undefined) throw new FarmNotFoundError(`No farm with slug "${slug}".`);
    const all = await this.repositories.produce.all();
    const missing = farm.produceSlugs.filter((item) => !all.some((p) => p.slug === item));
    if (missing.length > 0) {
      throw new BrokenReferenceError(`farms/${slug} → produce/${missing.join(', ')}`);
    }
    return Object.freeze({
      ...(await this.withRegion(farm, on)),
      produce: Object.freeze(all.filter((item) => farm.sells(item.slug))),
    });
  }

  private async withRegion(farm: Farm, on: Date): Promise<FarmWithRegion> {
    const region: Region | undefined = await this.repositories.regions.findBySlug(farm.regionSlug);
    if (region === undefined) {
      throw new BrokenReferenceError(`farms/${farm.slug} → regions/${farm.regionSlug}`);
    }
    return Object.freeze({ farm, region, certifiedOrganic: farm.isOrganicOn(on) });
  }
}
