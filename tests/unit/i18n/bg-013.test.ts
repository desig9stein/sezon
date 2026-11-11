import { describe, expect, it } from 'vitest';
import { Month } from '@contexts/seasonality';
import { monthAbbreviation, ui } from '@i18n/bg';

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

  it('QA 013: builds the heading from its lead', () => {
    expect(ui.home.heading(Month.of(11))).toBe(`${ui.home.headingLead} ноември`);
  });
});
