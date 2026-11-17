import type { Month } from '@contexts/seasonality';
import type { Produce } from '../domain/Produce';
import type { ProduceRepository } from '../domain/repositories';
import { seasonGroups, type SeasonGroups } from './seasonGroups';

/** Locale whose alphabet orders the wild produce by name. */
const NAME_LOCALE = 'bg';

/** Lists the produce gathered from the wild (spec 062). */
export class WildProduceService {
  constructor(private readonly produce: ProduceRepository) {}

  /** Returns every wild produce in Bulgarian alphabetical order of its name. */
  async all(): Promise<ReadonlyArray<Produce>> {
    const wild = (await this.produce.all()).filter((item) => item.wild);
    return Object.freeze(wild.sort((a, b) => a.name.localeCompare(b.name, NAME_LOCALE)));
  }

  /**
   * Splits the wild produce by its level in `month`, each group in alphabetical order.
   * @param month - Month whose levels group the produce.
   */
  async groupsFor(month: Month): Promise<SeasonGroups> {
    return seasonGroups(await this.all(), month);
  }
}
