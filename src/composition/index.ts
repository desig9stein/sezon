import { getCollection } from 'astro:content';
import {
  CatalogIndexService,
  MonthChangesService,
  NutrientRankingService,
  ProduceGroupIndexService,
  SeasonCalendarService,
  SeasonOverviewService,
  SectionIndexService,
} from '@contexts/catalog';
import type {
  Nutrient,
  NutrientRepository,
  Produce,
  ProduceGroup,
  ProduceGroupRepository,
  ProduceRepository,
} from '@contexts/catalog';
import { toNutrient, toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { SponsorSelectionService } from '@contexts/advertising';
import type { SponsorRepository } from '@contexts/advertising';
import { LoadedSponsorRepository } from '@contexts/advertising/infrastructure/LoadedSponsorRepository';
import { toSponsor } from '@contexts/advertising/infrastructure/mappers';
import type { Farm, FarmRepository } from '@contexts/farms';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import type { Region, RegionRepository } from '@contexts/geography';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { RecipeIndexService } from '@contexts/recipes';
import type { Recipe, RecipeRepository } from '@contexts/recipes';
import { IndexedRecipeRepository } from '@contexts/recipes/infrastructure/IndexedRecipeRepository';
import { toRecipe } from '@contexts/recipes/infrastructure/mappers';
import { BrokenReferenceError } from '@shared/domain/errors';
import { cachedLoad } from '@shared/infrastructure/cachedLoad';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { findBrokenReferences, type ContentRecords } from './contentIntegrity';
import { ProduceDetailsQuery } from './ProduceDetailsQuery';
import { FarmPagesQuery } from './FarmPagesQuery';
import { RecipePagesQuery } from './RecipePagesQuery';
import { RegionPagesQuery } from './RegionPagesQuery';

interface Content {
  readonly produce: ReadonlyArray<Produce>;
  readonly groups: ReadonlyArray<ProduceGroup>;
  readonly nutrients: ReadonlyArray<Nutrient>;
  readonly regions: ReadonlyArray<Region>;
  readonly farms: ReadonlyArray<Farm>;
  readonly recipes: ReadonlyArray<Recipe>;
}

function byId<T>(entries: ReadonlyArray<{ id: string; data: T }>): ReadonlyMap<string, T> {
  return new Map(entries.map((entry) => [entry.id, entry.data]));
}

async function loadContent(): Promise<Content> {
  const records: ContentRecords = {
    produce: byId(await getCollection('produce')),
    groups: byId(await getCollection('groups')),
    nutrients: byId(await getCollection('nutrients')),
    regions: byId(await getCollection('regions')),
    farms: byId(await getCollection('farms')),
    recipes: byId(await getCollection('recipes')),
  };
  const broken = findBrokenReferences(records);
  if (broken.length > 0) {
    throw new BrokenReferenceError(`Broken content references:\n${broken.join('\n')}`);
  }
  const map = <R, E>(entries: ReadonlyMap<string, R>, mapper: (id: string, record: R) => E) =>
    [...entries].map(([id, record]) => mapper(id, record));
  return {
    produce: map(records.produce, toProduce),
    groups: map(records.groups, toProduceGroup),
    nutrients: map(records.nutrients, toNutrient),
    regions: map(records.regions, toRegion),
    farms: map(records.farms, toFarm),
    recipes: map(records.recipes, toRecipe),
  };
}

const getContent = cachedLoad(loadContent);

/** Produce entities loaded from content collections. */
export const produceRepository: ProduceRepository = new IndexedRepository(
  async () => (await getContent()).produce,
);
/** Botanical groups loaded from content collections. */
export const produceGroupRepository: ProduceGroupRepository = new IndexedRepository(
  async () => (await getContent()).groups,
);
/** Nutrients loaded from content collections. */
export const nutrientRepository: NutrientRepository = new IndexedRepository(
  async () => (await getContent()).nutrients,
);
/** Provinces loaded from content collections. */
export const regionRepository: RegionRepository = new IndexedRepository(
  async () => (await getContent()).regions,
);
/** Farms loaded from content collections. */
export const farmRepository: FarmRepository = new IndexedFarmRepository(
  async () => (await getContent()).farms,
);

/** Recipes for winter preserves loaded from content collections. */
export const recipeRepository: RecipeRepository = new IndexedRecipeRepository(
  async () => (await getContent()).recipes,
);
/** Lists recipes by category and by produce. */
export const recipeIndexService = new RecipeIndexService(recipeRepository);
/** Read model for the recipe index and recipe pages. */
export const recipePagesQuery = new RecipePagesQuery({
  recipes: recipeRepository,
  produce: produceRepository,
});

/** Read model for produce detail pages. */
export const produceDetailsQuery = new ProduceDetailsQuery({
  produce: produceRepository,
  groups: produceGroupRepository,
  nutrients: nutrientRepository,
  regions: regionRepository,
  farms: farmRepository,
});

/** Read model for the farm list and farm pages. */
export const farmPagesQuery = new FarmPagesQuery({
  farms: farmRepository,
  regions: regionRepository,
  produce: produceRepository,
});

/** Read model for the region overview and region pages. */
export const regionPagesQuery = new RegionPagesQuery({
  regions: regionRepository,
  produce: produceRepository,
  farms: farmRepository,
});

/** Season overview queries over the content produce. */
export const seasonOverviewService = new SeasonOverviewService(produceRepository);

/** "What changes this month" queries over the content produce. */
export const monthChangesService = new MonthChangesService(produceRepository);

/** Ranks produce by vitamin or mineral content for nutrient pages. */
export const nutrientRankingService = new NutrientRankingService(
  produceRepository,
  nutrientRepository,
);
/** Lists the produce of one kind for its section page. */
export const sectionIndexService = new SectionIndexService(produceRepository);
/** Lists botanical groups and their produce for the group pages. */
export const produceGroupIndexService = new ProduceGroupIndexService(
  produceRepository,
  produceGroupRepository,
);
/** Lists sections, groups and nutrients for the catalogue page. */
export const catalogIndexService = new CatalogIndexService(
  produceRepository,
  produceGroupRepository,
  nutrientRepository,
);
/** Builds the year-at-a-glance calendar of the catalogue. */
export const seasonCalendarService = new SeasonCalendarService(produceRepository);

/** Sponsors loaded from the `sponsors` content collection. */
export const sponsorRepository: SponsorRepository = new LoadedSponsorRepository(async () =>
  (await getCollection('sponsors')).map((entry) => toSponsor(entry.id, entry.data)),
);
/** Chooses the sponsor shown in each ad slot. */
export const sponsorSelectionService = new SponsorSelectionService(sponsorRepository);
