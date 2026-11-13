import { describe, expect, it } from 'vitest';
import { latestMonthStart, yearInTimeZone } from '@composition/clock';
import { Month } from '@contexts/seasonality';

describe('yearInTimeZone', () => {
  it('QA 003: returns the Sofia year around New Year', () => {
    expect(yearInTimeZone(new Date('2026-12-31T21:59:59Z'))).toBe(2026);
    expect(yearInTimeZone(new Date('2026-12-31T22:30:00Z'))).toBe(2027);
  });
});

describe('latestMonthStart (spec 047)', () => {
  it.each([
    [11, '2026-11-13T10:00:00Z', '2026-10-31T22:00:00.000Z'],
    [12, '2026-11-13T10:00:00Z', '2025-11-30T22:00:00.000Z'],
    [7, '2026-11-13T10:00:00Z', '2026-06-30T21:00:00.000Z'],
    [1, '2026-11-13T10:00:00Z', '2025-12-31T22:00:00.000Z'],
    [11, '2026-10-31T22:05:00Z', '2026-10-31T22:00:00.000Z'],
    [11, '2026-10-31T21:59:00Z', '2025-10-31T22:00:00.000Z'],
  ])(
    'AC4: month %i at %s starts at %s (00:00 Europe/Sofia, never in the future)',
    (month, now, expected) => {
      expect(latestMonthStart(Month.of(month), new Date(now)).toISOString()).toBe(expected);
    },
  );
});
