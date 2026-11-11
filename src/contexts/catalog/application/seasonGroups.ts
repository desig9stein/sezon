import type { Month } from '@contexts/seasonality';
import { SeasonLevel } from '@contexts/seasonality';
import type { Produce } from '../domain/Produce';

/** Produce split by its season level in one month. */
export interface SeasonGroups {
  readonly month: Month;
  readonly peak: ReadonlyArray<Produce>;
  readonly available: ReadonlyArray<Produce>;
  readonly storage: ReadonlyArray<Produce>;
  readonly outOfSeason: ReadonlyArray<Produce>;
  readonly all: ReadonlyArray<Produce>;
  readonly count: number;
}

/**
 * Splits `items` by their level in `month`; produce without a level is out of season. Every
 * list keeps the order of `items`, and the result is frozen.
 */
export function seasonGroups(items: ReadonlyArray<Produce>, month: Month): SeasonGroups {
  const withLevel = (level: SeasonLevel | undefined) =>
    Object.freeze(items.filter((item) => item.levelIn(month) === level));
  return Object.freeze({
    month,
    peak: withLevel(SeasonLevel.PEAK),
    available: withLevel(SeasonLevel.AVAILABLE),
    storage: withLevel(SeasonLevel.STORAGE),
    outOfSeason: withLevel(undefined),
    all: Object.freeze([...items]),
    count: items.length,
  });
}
