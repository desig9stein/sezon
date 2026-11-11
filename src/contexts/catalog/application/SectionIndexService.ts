import type { Month } from '@contexts/seasonality';
import type { ProduceKind } from '../domain/ProduceKind';
import type { ProduceRepository } from '../domain/repositories';
import { seasonGroups, type SeasonGroups } from './seasonGroups';

/** All produce of one kind, grouped by its season level in one month. */
export interface SectionIndex extends SeasonGroups {
  readonly kind: ProduceKind;
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
    return Object.freeze({ ...seasonGroups(ofKind, month), kind });
  }
}
