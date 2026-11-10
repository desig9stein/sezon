import { describe, expect, it } from 'vitest';
import { SeasonCalendar } from '@contexts/seasonality/domain/SeasonCalendar';
import { Month } from '@contexts/seasonality/domain/Month';
import { SeasonLevel } from '@contexts/seasonality/domain/SeasonLevel';
import {
  InvalidMonthError,
  InvalidSeasonCalendarError,
  InvalidSeasonLevelError,
} from '@shared/domain/errors';

const calendar = SeasonCalendar.from([
  { month: 12, level: 'storage' },
  { month: 9, level: 'peak' },
  { month: 10, level: 'peak' },
  { month: 11, level: 'available' },
  { month: 1, level: 'storage' },
]);

describe('SeasonCalendar', () => {
  it('AC12: rejects an empty entry list', () => {
    expect(() => SeasonCalendar.from([])).toThrow(InvalidSeasonCalendarError);
  });

  it('AC12: rejects duplicate months', () => {
    expect(() =>
      SeasonCalendar.from([
        { month: 5, level: 'peak' },
        { month: 5, level: 'available' },
      ]),
    ).toThrow(InvalidSeasonCalendarError);
  });

  it('AC12: propagates invalid month and level errors', () => {
    expect(() => SeasonCalendar.from([{ month: 13, level: 'peak' }])).toThrow(InvalidMonthError);
    expect(() => SeasonCalendar.from([{ month: 1, level: 'ripe' }])).toThrow(
      InvalidSeasonLevelError,
    );
  });

  it('AC13: returns the level for a month, or undefined when out of season', () => {
    expect(calendar.levelIn(Month.of(9))).toBe(SeasonLevel.PEAK);
    expect(calendar.levelIn(Month.of(11))).toBe(SeasonLevel.AVAILABLE);
    expect(calendar.levelIn(Month.of(12))).toBe(SeasonLevel.STORAGE);
    expect(calendar.levelIn(Month.of(6))).toBeUndefined();
  });

  it('AC13: reports freshness per month', () => {
    expect(calendar.isFreshIn(Month.of(10))).toBe(true);
    expect(calendar.isFreshIn(Month.of(11))).toBe(true);
    expect(calendar.isFreshIn(Month.of(12))).toBe(false);
    expect(calendar.isFreshIn(Month.of(6))).toBe(false);
  });

  it('AC13: lists months and fresh months in calendar order', () => {
    expect(calendar.months().map((m) => m.number)).toEqual([1, 9, 10, 11, 12]);
    expect(calendar.freshMonths().map((m) => m.number)).toEqual([9, 10, 11]);
  });
});
