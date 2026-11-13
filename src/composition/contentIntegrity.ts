import type {
  GroupRecord,
  NutrientRecord,
  ProduceRecord,
} from '@contexts/catalog/infrastructure/schemas';
import type { FarmRecord } from '@contexts/farms/infrastructure/schemas';
import type { RegionRecord } from '@contexts/geography/infrastructure/schemas';
import type { RecipeRecord } from '@contexts/recipes/infrastructure/schemas';

/** All validated content records, keyed by entry id, per collection. */
export interface ContentRecords {
  readonly produce: ReadonlyMap<string, ProduceRecord>;
  readonly groups: ReadonlyMap<string, GroupRecord>;
  readonly nutrients: ReadonlyMap<string, NutrientRecord>;
  readonly regions: ReadonlyMap<string, RegionRecord>;
  readonly farms: ReadonlyMap<string, FarmRecord>;
  readonly recipes: ReadonlyMap<string, RecipeRecord>;
}

type CollectionName = keyof ContentRecords;

interface Reference {
  readonly from: `${CollectionName}/${string}`;
  readonly to: CollectionName;
  readonly id: string;
}

function* referencesOf(content: ContentRecords): Generator<Reference> {
  for (const [id, produce] of content.produce) {
    yield { from: `produce/${id}`, to: 'groups', id: produce.group };
    for (const { region } of produce.regions) {
      yield { from: `produce/${id}`, to: 'regions', id: region };
    }
    for (const { nutrient } of produce.nutrition?.micronutrients ?? []) {
      yield { from: `produce/${id}`, to: 'nutrients', id: nutrient };
    }
  }
  for (const [id, farm] of content.farms) {
    yield { from: `farms/${id}`, to: 'regions', id: farm.region };
    for (const produce of farm.produce) {
      yield { from: `farms/${id}`, to: 'produce', id: produce };
    }
  }
  for (const [id, recipe] of content.recipes) {
    for (const produce of recipe.produce) {
      yield { from: `recipes/${id}`, to: 'produce', id: produce };
    }
  }
}

/**
 * Lists every reference between content entries that points to a missing entry.
 * @returns Messages in the form `produce/zele → groups/missing`; empty when all resolve.
 */
export function findBrokenReferences(content: ContentRecords): string[] {
  const broken: string[] = [];
  for (const reference of referencesOf(content)) {
    if (!content[reference.to].has(reference.id)) {
      broken.push(`${reference.from} → ${reference.to}/${reference.id}`);
    }
  }
  return broken;
}
