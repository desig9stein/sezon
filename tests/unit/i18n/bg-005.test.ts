import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, produceTitle } from '@i18n/bg';

describe('produceTitle', () => {
  it('AC3: uses the full variant when it fits', () => {
    expect(produceTitle('Ябълки')).toBe('Ябълки – сезон, хранителни стойности и ферми');
  });

  it('AC3: falls back to shorter variants', () => {
    const name = 'Б'.repeat(20);
    expect(produceTitle(name)).toBe(`${name} – сезон и хранителни стойности`);
    const longName = 'Б'.repeat(40);
    expect(produceTitle(longName)).toBe(longName);
  });
});

describe('formatNumber', () => {
  it.each([
    [36.6, '36,6'],
    [1640, '1640'],
    [0.333, '0,33'],
    [2, '2'],
    [12345.6, '12 345,6'],
  ])('AC4: formats %s as %s', (value, expected) => {
    expect(formatNumber(value).replace(/\s/g, ' ')).toBe(expected);
  });
});

describe('formatDate', () => {
  it('AC4: formats a date in Bulgarian', () => {
    expect(formatDate(new Date('2026-11-10'))).toBe('10 ноември 2026 г.');
  });
});
