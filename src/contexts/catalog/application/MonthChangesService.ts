import type { Month } from '@contexts/seasonality';
import { SeasonLevel } from '@contexts/seasonality';
import { GROWING_ACTIVITIES, type GrowingActivity } from '../domain/GrowingGuide';
import type { Produce } from '../domain/Produce';
import type { ProduceRepository } from '../domain/repositories';

/** A produce that was at its peak in the previous month and is not now. */
export interface LeavingPeak {
  readonly produce: Produce;
  /** Its level now, or `undefined` when it is out of season. */
  readonly levelNow: SeasonLevel | undefined;
}

/** A produce with garden work in the month. */
export interface GardenJob {
  readonly produce: Produce;
  /** The month's activities, in {@link GROWING_ACTIVITIES} order. */
  readonly activities: ReadonlyArray<GrowingActivity>;
}

/** What changed in one month compared with the previous one. */
export interface MonthChanges {
  readonly month: Month;
  readonly previous: Month;
  readonly enteringPeak: ReadonlyArray<Produce>;
  readonly stayingPeak: ReadonlyArray<Produce>;
  readonly leavingPeak: ReadonlyArray<LeavingPeak>;
  readonly toStorage: ReadonlyArray<Produce>;
  readonly garden: ReadonlyArray<GardenJob>;
  readonly isEmpty: boolean;
}

/** Answers "what changes this month" from the season and growing data. */
export class MonthChangesService {
  constructor(private readonly produce: ProduceRepository) {}

  /**
   * Compares each produce's level in `month` with the previous month and collects the month's
   * garden activities. Lists keep the repository order; the result is frozen.
   */
  async changesFor(month: Month): Promise<MonthChanges> {
    const all = await this.produce.all();
    const previous = month.previous();
    const isPeak = (item: Produce, at: Month) => item.levelIn(at) === SeasonLevel.PEAK;
    const enteringPeak = all.filter((item) => isPeak(item, month) && !isPeak(item, previous));
    const stayingPeak = all.filter((item) => isPeak(item, month) && isPeak(item, previous));
    const leavingPeak = all
      .filter((item) => isPeak(item, previous) && !isPeak(item, month))
      .map((item) => Object.freeze({ produce: item, levelNow: item.levelIn(month) }));
    const toStorage = all.filter(
      (item) =>
        item.levelIn(month) === SeasonLevel.STORAGE &&
        item.levelIn(previous) !== SeasonLevel.STORAGE,
    );
    const garden = all.flatMap((item) => {
      const { growing } = item;
      if (growing === undefined) return [];
      const activities = GROWING_ACTIVITIES.filter((activity) =>
        growing.monthsOf(activity).includes(month),
      );
      return activities.length === 0 ? [] : [Object.freeze({ produce: item, activities })];
    });
    const lists = [enteringPeak, stayingPeak, leavingPeak, toStorage, garden];
    return Object.freeze({
      month,
      previous,
      enteringPeak: Object.freeze(enteringPeak),
      stayingPeak: Object.freeze(stayingPeak),
      leavingPeak: Object.freeze(leavingPeak),
      toStorage: Object.freeze(toStorage),
      garden: Object.freeze(garden),
      isEmpty: lists.every((list) => list.length === 0),
    });
  }
}
