import { describe, expect, it } from 'vitest';
import { Month } from '@contexts/seasonality';
import { monthAbbreviation, romanNumeral, ui } from '@i18n/bg';
import { InvalidMonthError } from '@shared/domain/errors';

describe('atlas texts (spec 013)', () => {
  it('AC1: abbreviates every month to three letters', () => {
    expect(Month.all().map(monthAbbreviation)).toEqual([
      'Яну',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Юни',
      'Юли',
      'Авг',
      'Сеп',
      'Окт',
      'Ное',
      'Дек',
    ]);
  });

  it('AC1: writes 1–12 as Roman numerals and labels the month plate', () => {
    expect(Array.from({ length: 12 }, (_, i) => romanNumeral(i + 1))).toEqual([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
    ]);
    expect(ui.home.plate(Month.of(11))).toBe('Табло XI от XII');
    expect(ui.ribbon.label).toBe('Месеци');
  });

  it.each([0, 13])('QA 013: romanNumeral rejects %s', (value) => {
    expect(() => romanNumeral(value)).toThrow(InvalidMonthError);
  });

  it('QA 013: builds the heading from its lead', () => {
    expect(ui.home.heading(Month.of(11))).toBe(`${ui.home.headingLead} ноември`);
  });
});
