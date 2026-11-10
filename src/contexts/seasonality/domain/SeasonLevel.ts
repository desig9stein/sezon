import { InvalidSeasonLevelError } from '@shared/domain/errors';

/** Raw season level values as stored in content, ordered from lowest to highest rank. */
export const SEASON_LEVEL_VALUES = ['storage', 'available', 'peak'] as const;

export type SeasonLevelValue = (typeof SEASON_LEVEL_VALUES)[number];

/** How available a produce is in a month: at its peak, available fresh, or from storage. */
export class SeasonLevel {
  static readonly PEAK = new SeasonLevel('peak', true);
  static readonly AVAILABLE = new SeasonLevel('available', true);
  static readonly STORAGE = new SeasonLevel('storage', false);

  private static readonly byValue: ReadonlyMap<string, SeasonLevel> = new Map(
    [SeasonLevel.PEAK, SeasonLevel.AVAILABLE, SeasonLevel.STORAGE].map((level) => [
      level.value,
      level,
    ]),
  );

  private readonly rank: number;

  private constructor(
    readonly value: SeasonLevelValue,
    private readonly fresh: boolean,
  ) {
    this.rank = SEASON_LEVEL_VALUES.indexOf(value);
    Object.freeze(this);
  }

  /**
   * Returns the level for a raw value.
   * @throws InvalidSeasonLevelError when `value` is not `peak`, `available` or `storage`.
   */
  static of(value: string): SeasonLevel {
    const level = SeasonLevel.byValue.get(value);
    if (level === undefined) {
      throw new InvalidSeasonLevelError(`"${value}" is not a season level.`);
    }
    return level;
  }

  /** Returns `true` when this level ranks above `other` (peak > available > storage). */
  isHigherThan(other: SeasonLevel): boolean {
    return this.rank > other.rank;
  }

  /** Returns `true` for levels where the produce is harvested fresh (peak, available). */
  isFresh(): boolean {
    return this.fresh;
  }
}
