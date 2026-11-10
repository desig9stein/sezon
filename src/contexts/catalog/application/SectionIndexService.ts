import type { Month } from '@contexts/seasonality';
import { SeasonLevel } from '@contexts/seasonality';
import type { Produce } from '../domain/Produce';
import type { ProduceKind } from '../domain/ProduceKind';
import type { ProduceRepository } from '../domain/repositories';

/** All produce of one kind, grouped by its season level in one month. */
export interface SectionIndex {
  readonly kind: ProduceKind;
  readonly month: Month;
  readonly peak: ReadonlyArray<Produce>;
  readonly available: ReadonlyArray<Produce>;
  readonly storage: ReadonlyArray<Produce>;
  readonly outOfSeason: ReadonlyArray<Produce>;
  readonly all: ReadonlyArray<Produce>;
  readonly count: number;
}

/** Lists the produce of one kind for its section index page. */
export class SectionIndexService {
  constructor(private readonly produce: ProduceRepository) {}

  /**
   * Groups every produce of `kind` by its level in `month`; produce without a level is out of
   * season. `all` lists every produce of the kind. Lists keep the repository order.
   */
  async sectionFor(kind: ProduceKind, month: Month): Promise<SectionIndex> {
    const ofKind = (await this.produce.all()).filter((item) => item.kind === kind);
    const withLevel = (level: SeasonLevel | undefined) =>
      Object.freeze(ofKind.filter((item) => item.levelIn(month) === level));
    return Object.freeze({
      kind,
      month,
      peak: withLevel(SeasonLevel.PEAK),
      available: withLevel(SeasonLevel.AVAILABLE),
      storage: withLevel(SeasonLevel.STORAGE),
      outOfSeason: withLevel(undefined),
      all: Object.freeze(ofKind),
      count: ofKind.length,
    });
  }
}
