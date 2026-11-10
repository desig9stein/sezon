import { describe, expect, it } from 'vitest';
import { SeasonLevel } from '@contexts/seasonality/domain/SeasonLevel';
import { InvalidSeasonLevelError } from '@shared/domain/errors';

describe('SeasonLevel', () => {
  it('AC11: parses the three known levels into shared constants', () => {
    expect(SeasonLevel.of('peak')).toBe(SeasonLevel.PEAK);
    expect(SeasonLevel.of('available')).toBe(SeasonLevel.AVAILABLE);
    expect(SeasonLevel.of('storage')).toBe(SeasonLevel.STORAGE);
    expect(SeasonLevel.PEAK.value).toBe('peak');
  });

  it.each(['', 'Peak', 'imported', ' peak'])('AC11: rejects "%s"', (value) => {
    expect(() => SeasonLevel.of(value)).toThrow(InvalidSeasonLevelError);
  });

  it('AC11: orders peak > available > storage', () => {
    expect(SeasonLevel.PEAK.isHigherThan(SeasonLevel.AVAILABLE)).toBe(true);
    expect(SeasonLevel.AVAILABLE.isHigherThan(SeasonLevel.STORAGE)).toBe(true);
    expect(SeasonLevel.STORAGE.isHigherThan(SeasonLevel.PEAK)).toBe(false);
    expect(SeasonLevel.PEAK.isHigherThan(SeasonLevel.PEAK)).toBe(false);
  });

  it('AC11: treats peak and available as fresh and storage as not fresh', () => {
    expect(SeasonLevel.PEAK.isFresh()).toBe(true);
    expect(SeasonLevel.AVAILABLE.isFresh()).toBe(true);
    expect(SeasonLevel.STORAGE.isFresh()).toBe(false);
  });
});
