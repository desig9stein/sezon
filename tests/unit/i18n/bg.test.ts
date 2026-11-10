import { describe, expect, it } from 'vitest';
import { Month } from '@contexts/seasonality';
import { monthName, monthNameLower, ui } from '@i18n/bg';

const LONG_NAMES = [
  'Брюкселско зеле',
  'Червено цвекло',
  'Коренова целина',
  'Зелен лук',
  'Кисели череши',
  'Магданоз',
];

describe('ui.monthPage.description', () => {
  it.each(Month.all().map((month) => [month.slug, month] as const))(
    'AC10: stays within 70–160 characters for %s',
    (_slug, month) => {
      for (const names of [[], ['Зеле'], LONG_NAMES]) {
        const description = ui.monthPage.description(month, names);
        expect(description.length).toBeGreaterThanOrEqual(70);
        expect(description.length).toBeLessThanOrEqual(160);
        expect(description).toContain(monthNameLower(month));
      }
    },
  );
});

describe('month names', () => {
  it('returns capitalised and lowercase names', () => {
    expect(monthName(Month.of(11))).toBe('Ноември');
    expect(monthNameLower(Month.of(5))).toBe('май');
  });
});

describe('ui.home.description', () => {
  it.each(Month.all().map((month) => [month.slug, month] as const))(
    'stays within 70–160 characters for %s',
    (_slug, month) => {
      const description = ui.home.description(month);
      expect(description.length).toBeGreaterThanOrEqual(70);
      expect(description.length).toBeLessThanOrEqual(160);
    },
  );
});
