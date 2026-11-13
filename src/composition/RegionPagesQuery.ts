import type { Produce, ProduceRepository } from '@contexts/catalog';
import type { Farm, FarmRepository } from '@contexts/farms';
import {
  type AreaRank,
  type Region,
  type RegionRepository,
  utilisedAreaRank,
} from '@contexts/geography';
import { RegionNotFoundError } from '@shared/domain/errors';
import type { FarmWithRegion } from './ProduceDetailsQuery';

/** One region in the overview, with how much the site knows about it. */
export interface RegionSummary {
  readonly region: Region;
  readonly produceCount: number;
  readonly farmCount: number;
  /** Whether the region has its own page (a profile, or at least one produce or farm). */
  readonly hasPage: boolean;
}

/** A produce grown in a region, with the editorial note on why it grows well there. */
export interface RegionProduce {
  readonly produce: Produce;
  readonly note: string;
}

/** Everything a region page shows. */
export interface RegionPage {
  readonly region: Region;
  readonly produce: ReadonlyArray<RegionProduce>;
  readonly farms: ReadonlyArray<FarmWithRegion>;
  /** Rank of the utilised agricultural area, when the region has a profile. */
  readonly areaRank: AreaRank | undefined;
}

/** Repositories the query reads from. */
export interface RegionPagesRepositories {
  readonly regions: RegionRepository;
  readonly produce: ProduceRepository;
  readonly farms: FarmRepository;
}

/** Read model for the region overview and the region pages, across geography, catalog and farms. */
export class RegionPagesQuery {
  constructor(private readonly repositories: RegionPagesRepositories) {}

  /** Returns every region in Bulgarian name order with its produce and farm counts. */
  async overview(): Promise<ReadonlyArray<RegionSummary>> {
    const [regions, produce, farms] = await Promise.all([
      this.repositories.regions.all(),
      this.repositories.produce.all(),
      this.repositories.farms.all(),
    ]);
    return regions.map((region) => {
      const produceCount = produce.filter((item) => growsIn(item, region.slug)).length;
      const farmCount = farms.filter((farm) => farm.regionSlug === region.slug).length;
      return Object.freeze({
        region,
        produceCount,
        farmCount,
        hasPage: region.profile !== undefined || produceCount + farmCount > 0,
      });
    });
  }

  /** Returns the slugs of the regions that have a page, in Bulgarian name order. */
  async pageSlugs(): Promise<ReadonlyArray<string>> {
    return (await this.overview())
      .filter((summary) => summary.hasPage)
      .map((summary) => summary.region.slug);
  }

  /**
   * Returns the region with `slug`, its produce with notes in repository order and its farms with
   * sponsored farms first; farms are marked organic for the day of `on`. The rank of its utilised
   * area is among all regions with a profile.
   * @throws RegionNotFoundError when no region has that slug.
   */
  async forSlug(slug: string, on: Date): Promise<RegionPage> {
    const region = await this.repositories.regions.findBySlug(slug);
    if (region === undefined) throw new RegionNotFoundError(`No region with slug "${slug}".`);
    const [regions, produce, farms] = await Promise.all([
      this.repositories.regions.all(),
      this.repositories.produce.all(),
      this.repositories.farms.all(),
    ]);
    const grown = produce.flatMap((item) =>
      item.growingRegions
        .filter((entry) => entry.regionSlug === slug)
        .map((entry) => Object.freeze({ produce: item, note: entry.note })),
    );
    const local = farms.filter((farm) => farm.regionSlug === slug);
    const ordered: ReadonlyArray<Farm> = [
      ...local.filter((farm) => farm.sponsored),
      ...local.filter((farm) => !farm.sponsored),
    ];
    return Object.freeze({
      region,
      produce: Object.freeze(grown),
      farms: Object.freeze(
        ordered.map((farm) =>
          Object.freeze({ farm, region, certifiedOrganic: farm.isOrganicOn(on) }),
        ),
      ),
      areaRank: utilisedAreaRank(regions, slug),
    });
  }
}

const growsIn = (produce: Produce, regionSlug: string): boolean =>
  produce.growingRegions.some((entry) => entry.regionSlug === regionSlug);
