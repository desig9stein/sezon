import type {
  Nutrient,
  NutrientRepository,
  Produce,
  ProduceGroup,
  ProduceGroupRepository,
  ProduceRepository,
  Source,
} from '@contexts/catalog';
import type { Farm, FarmRepository } from '@contexts/farms';
import type { Region, RegionRepository } from '@contexts/geography';
import { BrokenReferenceError, ProduceNotFoundError } from '@shared/domain/errors';

/** A micronutrient amount resolved to its nutrient, with % of the reference intake. */
export interface ResolvedMicronutrient {
  readonly nutrient: Nutrient;
  readonly amount: number;
  readonly percentOfReferenceIntake: number;
}

/** A growing region resolved to its entity, with the editorial note. */
export interface ResolvedGrowingRegion {
  readonly region: Region;
  readonly note: string;
}

/** A farm with its province resolved. */
export interface FarmWithRegion {
  readonly farm: Farm;
  readonly region: Region;
}

/** Everything the produce page shows, resolved across bounded contexts. */
export interface ProduceDetails {
  readonly produce: Produce;
  readonly group: ProduceGroup;
  readonly micronutrients: ReadonlyArray<ResolvedMicronutrient>;
  readonly growingRegions: ReadonlyArray<ResolvedGrowingRegion>;
  readonly farms: ReadonlyArray<FarmWithRegion>;
  readonly sources: ReadonlyArray<Source>;
}

/** Repositories the query reads from. */
export interface ProduceDetailsRepositories {
  readonly produce: ProduceRepository;
  readonly groups: ProduceGroupRepository;
  readonly nutrients: NutrientRepository;
  readonly regions: RegionRepository;
  readonly farms: FarmRepository;
}

async function resolve<T>(
  find: (slug: string) => Promise<T | undefined>,
  slug: string,
  label: string,
  from: string,
): Promise<T> {
  const entity = await find(slug);
  if (entity === undefined) {
    throw new BrokenReferenceError(`${from} → ${label}/${slug}`);
  }
  return entity;
}

function uniqueSources(sources: ReadonlyArray<Source>): ReadonlyArray<Source> {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.url}\n${source.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/** Read model for the produce detail page. */
export class ProduceDetailsQuery {
  constructor(private readonly repositories: ProduceDetailsRepositories) {}

  /** Returns the slugs of every produce, sorted by Bulgarian name. */
  async allSlugs(): Promise<string[]> {
    return (await this.repositories.produce.all()).map((produce) => produce.slug);
  }

  /**
   * Returns the details of the produce with `slug`.
   * @throws ProduceNotFoundError when no produce has that slug.
   * @throws BrokenReferenceError when its group, a nutrient or a region does not exist.
   */
  async forSlug(slug: string): Promise<ProduceDetails> {
    const { produce: produceRepository, groups, nutrients, regions, farms } = this.repositories;
    const produce = await produceRepository.findBySlug(slug);
    if (produce === undefined) {
      throw new ProduceNotFoundError(`No produce with slug "${slug}".`);
    }
    const find = <T>(repository: { findBySlug(slug: string): Promise<T | undefined> }) =>
      repository.findBySlug.bind(repository);

    const group = await resolve(find(groups), produce.groupSlug, 'groups', `produce/${slug}`);
    const micronutrients = await Promise.all(
      produce.nutrition.micronutrients.map(async ({ nutrientSlug, amount }) => {
        const nutrient = await resolve(
          find(nutrients),
          nutrientSlug,
          'nutrients',
          `produce/${slug}`,
        );
        return Object.freeze({
          nutrient,
          amount,
          percentOfReferenceIntake: nutrient.percentOfReferenceIntake(amount),
        });
      }),
    );
    const growingRegions = await Promise.all(
      produce.growingRegions.map(async ({ regionSlug, note }) =>
        Object.freeze({
          region: await resolve(find(regions), regionSlug, 'regions', `produce/${slug}`),
          note,
        }),
      ),
    );
    const sellers = await farms.findByProduce(slug);
    const sponsoredFirst = [
      ...sellers.filter((farm) => farm.sponsored),
      ...sellers.filter((farm) => !farm.sponsored),
    ];
    const farmsWithRegions = await Promise.all(
      sponsoredFirst.map(async (farm) =>
        Object.freeze({
          farm,
          region: await resolve(find(regions), farm.regionSlug, 'regions', `farms/${farm.slug}`),
        }),
      ),
    );

    return Object.freeze({
      produce,
      group,
      micronutrients: Object.freeze(micronutrients),
      growingRegions: Object.freeze(growingRegions),
      farms: Object.freeze(farmsWithRegions),
      sources: Object.freeze(
        uniqueSources([
          produce.nutrition.source,
          ...produce.traditionalUses.map((use) => use.source),
          ...(produce.growing === undefined ? [] : [produce.growing.source]),
        ]),
      ),
    });
  }
}
