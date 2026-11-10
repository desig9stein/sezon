import type { Month } from '@contexts/seasonality';
import { SeasonLevel } from '@contexts/seasonality';
import type { Produce } from '../domain/Produce';
import type { ProduceRepository } from '../domain/repositories';

/** Produce grouped by how seasonal it is in one month. */
export interface SeasonOverview {
  readonly month: Month;
  readonly peak: ReadonlyArray<Produce>;
  readonly available: ReadonlyArray<Produce>;
  readonly storage: ReadonlyArray<Produce>;
  readonly comingSoon: ReadonlyArray<Produce>;
  readonly freshCount: number;
}

/** Answers "what is in season" questions for a month. */
export class SeasonOverviewService {
  constructor(private readonly produce: ProduceRepository) {}

  /**
   * Groups all produce by its level in `month`. Produce out of season in `month` but fresh
   * in the following month is listed as coming soon. Lists keep the repository order.
   */
  async overviewFor(month: Month): Promise<SeasonOverview> {
    const all = await this.produce.all();
    const withLevel = (level: SeasonLevel) =>
      Object.freeze(all.filter((item) => item.levelIn(month) === level));
    const next = month.next();
    const peak = withLevel(SeasonLevel.PEAK);
    const available = withLevel(SeasonLevel.AVAILABLE);
    return Object.freeze({
      month,
      peak,
      available,
      storage: withLevel(SeasonLevel.STORAGE),
      comingSoon: Object.freeze(
        all.filter((item) => item.levelIn(month) === undefined && item.isFreshIn(next)),
      ),
      freshCount: peak.length + available.length,
    });
  }
}
