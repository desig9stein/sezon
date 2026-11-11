import { describe, expect, it } from 'vitest';
import { Month } from '@contexts/seasonality';
import { monthRanges } from '@i18n/bg';

const months = (...numbers: number[]) => numbers.map((number) => Month.of(number));
const text = (ranges: ReturnType<typeof monthRanges>) =>
  ranges.map((range) => range.map((month) => month.number).join('-')).join(', ');

describe('monthRanges', () => {
  it.each([
    [[3], '3'],
    [[3, 4, 5], '3-5'],
    [[2, 3, 10, 11], '2-3, 10-11'],
    [[1, 11, 12], '11-1'],
    [[], ''],
  ])('AC3: groups %j into ranges %s', (numbers, expected) => {
    expect(text(monthRanges(months(...numbers)))).toBe(expected);
  });
});
