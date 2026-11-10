import { describe, expect, it } from 'vitest';
import { Month } from '@contexts/seasonality/domain/Month';
import { InvalidMonthError } from '@shared/domain/errors';

const SLUGS = [
  'yanuari',
  'fevruari',
  'mart',
  'april',
  'may',
  'yuni',
  'yuli',
  'avgust',
  'septemvri',
  'oktomvri',
  'noemvri',
  'dekemvri',
];

describe('Month', () => {
  it('AC7: creates months 1–12 and returns shared instances', () => {
    expect(Month.of(1).number).toBe(1);
    expect(Month.of(12).number).toBe(12);
    expect(Month.of(11)).toBe(Month.of(11));
  });

  it.each([0, 13, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('AC7: rejects %s', (value) => {
    expect(() => Month.of(value)).toThrow(InvalidMonthError);
  });

  it.each([
    ['2026-10-31T21:59:59Z', 10],
    ['2026-10-31T22:00:00Z', 11],
    ['2026-03-31T20:59:59Z', 3],
    ['2026-03-31T21:00:00Z', 4],
    ['2026-12-31T22:00:00Z', 1],
  ])('AC8: %s is month %i in Europe/Sofia', (iso, expected) => {
    expect(Month.fromDate(new Date(iso)).number).toBe(expected);
  });

  it('AC8: honours an explicit timezone', () => {
    expect(Month.fromDate(new Date('2026-10-31T22:30:00Z'), 'UTC').number).toBe(10);
  });

  it('AC8: rejects an invalid date', () => {
    expect(() => Month.fromDate(new Date('invalid'))).toThrow(InvalidMonthError);
  });

  it('AC9: wraps around with next and previous', () => {
    expect(Month.of(12).next()).toBe(Month.of(1));
    expect(Month.of(1).previous()).toBe(Month.of(12));
    expect(Month.of(6).next()).toBe(Month.of(7));
    expect(Month.of(6).previous()).toBe(Month.of(5));
  });

  it('AC10: exposes Latin slugs in calendar order and round-trips them', () => {
    expect(Month.all().map((month) => month.slug)).toEqual(SLUGS);
    for (const month of Month.all()) {
      expect(Month.fromSlug(month.slug)).toBe(month);
    }
  });

  it.each(['', 'november', 'Noemvri', 'noemvri '])('AC10: fromSlug rejects "%s"', (slug) => {
    expect(() => Month.fromSlug(slug)).toThrow(InvalidMonthError);
  });

  it('returns a new array from all() each time', () => {
    const first = Month.all();
    expect(first).toHaveLength(12);
    expect(Month.all()).not.toBe(first);
  });
});
