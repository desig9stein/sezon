import type { Nutrient } from '../domain/Nutrient';
import type { ProduceGroup } from '../domain/ProduceGroup';
import { PRODUCE_KINDS, type ProduceKind } from '../domain/ProduceKind';
import type {
  NutrientRepository,
  ProduceGroupRepository,
  ProduceRepository,
} from '../domain/repositories';

/** Everything the catalogue page lists: sections and groups with their produce counts, nutrients. */
export interface CatalogIndex {
  readonly sections: ReadonlyArray<{ readonly kind: ProduceKind; readonly count: number }>;
  readonly groups: ReadonlyArray<{ readonly group: ProduceGroup; readonly count: number }>;
  readonly nutrients: ReadonlyArray<Nutrient>;
}

/** Builds the catalogue overview of sections, botanical groups and nutrients. */
export class CatalogIndexService {
  constructor(
    private readonly produce: ProduceRepository,
    private readonly groups: ProduceGroupRepository,
    private readonly nutrients: NutrientRepository,
  ) {}

  /**
   * Returns every section in kind order and every group in name order, each with its number of
   * produce (0 included), and every nutrient in name order.
   */
  async index(): Promise<CatalogIndex> {
    const [produce, groups, nutrients] = await Promise.all([
      this.produce.all(),
      this.groups.all(),
      this.nutrients.all(),
    ]);
    const countWhere = (matches: (item: (typeof produce)[number]) => boolean) =>
      produce.filter(matches).length;
    return Object.freeze({
      sections: Object.freeze(
        PRODUCE_KINDS.map((kind) => ({ kind, count: countWhere((item) => item.kind === kind) })),
      ),
      groups: Object.freeze(
        groups.map((group) => ({
          group,
          count: countWhere((item) => item.groupSlug === group.slug),
        })),
      ),
      nutrients,
    });
  }
}
