import { InvalidSeasonCalendarError } from '@shared/domain/errors';
import { Month } from './Month';
import { SeasonLevel } from './SeasonLevel';

/** Raw season calendar entry as stored in content. */
export interface SeasonEntryInput {
  readonly month: number;
  readonly level: string;
}

/** The season level of a produce for each month in which it is available. */
export class SeasonCalendar {
  private constructor(private readonly levels: ReadonlyMap<Month, SeasonLevel>) {}

  /**
   * Builds a calendar from raw entries.
   * @throws InvalidSeasonCalendarError when `entries` is empty or repeats a month.
   * @throws InvalidMonthError | InvalidSeasonLevelError for invalid entry values.
   */
  static from(entries: ReadonlyArray<SeasonEntryInput>): SeasonCalendar {
    if (entries.length === 0) {
      throw new InvalidSeasonCalendarError('A season calendar needs at least one month.');
    }
    const levels = new Map<Month, SeasonLevel>();
    for (const entry of entries) {
      const month = Month.of(entry.month);
      if (levels.has(month)) {
        throw new InvalidSeasonCalendarError(`Month ${month.number} appears more than once.`);
      }
      levels.set(month, SeasonLevel.of(entry.level));
    }
    return new SeasonCalendar(levels);
  }

  /** Returns the level in `month`, or `undefined` when the produce is out of season. */
  levelIn(month: Month): SeasonLevel | undefined {
    return this.levels.get(month);
  }

  /** Returns `true` when the produce is harvested fresh in `month`. */
  isFreshIn(month: Month): boolean {
    return this.levelIn(month)?.isFresh() ?? false;
  }

  /** Returns the months that have a level, in calendar order. */
  months(): Month[] {
    return Month.all().filter((month) => this.levels.has(month));
  }

  /** Returns the months with a fresh level, in calendar order. */
  freshMonths(): Month[] {
    return Month.all().filter((month) => this.isFreshIn(month));
  }
}
