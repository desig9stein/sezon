import type { Produce, ProduceRepository } from '@contexts/catalog';
import type { Farm, FarmRepository } from '@contexts/farms';
import { surroundingRegionSlug, type Region, type RegionRepository } from '@contexts/geography';
import { BrokenReferenceError, FarmNotFoundError } from '@shared/domain/errors';
import type { FarmWithRegion } from './ProduceDetailsQuery';

/** Everything a farm page shows. */
export interface FarmPage extends FarmWithRegion {
  /** The produce the farm sells, in Bulgarian name order. */
  readonly produce: ReadonlyArray<Produce>;
}

/** The farms of one region, for the farm list grouped by province. */
export interface RegionFarms {
  readonly region: Region;
  /** The region's farms in Bulgarian name order. */
  readonly farms: ReadonlyArray<FarmWithRegion>;
  /** The province around this one and its number of farms, when it has farms (spec 062). */
  readonly surrounding?: { readonly region: Region; readonly farmCount: number } | undefined;
}

const bulgarianCollator = new Intl.Collator('bg');

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
   * Returns the farms grouped by region, regions in Bulgarian alphabetical order of their name,
   * farms in name order; regions without farms are left out. A region inside another province
   * names that province and its farm count (`surrounding`).
   * @param on - Day for the organic status.
   * @throws BrokenReferenceError when a farm's region does not exist.
   */
  async byRegion(on: Date): Promise<ReadonlyArray<RegionFarms>> {
    const groups = new Map<string, { region: Region; farms: FarmWithRegion[] }>();
    for (const entry of await this.all(on)) {
      const group = groups.get(entry.region.slug) ?? { region: entry.region, farms: [] };
      group.farms.push(entry);
      groups.set(entry.region.slug, group);
    }
    const surroundingOf = (slug: string) => {
      const around = groups.get(surroundingRegionSlug(slug) ?? '');
      return around === undefined
        ? undefined
        : Object.freeze({ region: around.region, farmCount: around.farms.length });
    };
    return Object.freeze(
      [...groups.values()]
        .sort((a, b) => bulgarianCollator.compare(a.region.name, b.region.name))
        .map((group) =>
          Object.freeze({
            region: group.region,
            farms: Object.freeze(group.farms),
            surrounding: surroundingOf(group.region.slug),
          }),
        ),
    );
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
