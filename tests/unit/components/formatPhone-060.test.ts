import { describe, expect, it } from 'vitest';
import { formatPhone } from '@components/farms/formatPhone';

/** Writes the expected groups joined by no-break spaces, as `formatPhone` does. */
const grouped = (...groups: string[]) => groups.join('\u00a0');

describe('formatPhone (spec 060)', () => {
  it('AC10: groups a mobile number as +359 XXX XXX XXX', () => {
    expect(formatPhone('+359899909310')).toBe(grouped('+359', '899', '909', '310'));
  });

  it('AC10: groups a Sofia number as +359 2 XXX XXXX', () => {
    expect(formatPhone('+35921234567')).toBe(grouped('+359', '2', '123', '4567'));
  });

  it('QA 060: leaves a number outside Sofia and the mobile ranges ungrouped after +359', () => {
    expect(formatPhone('+35930112345')).toBe(grouped('+359', '30112345'));
    expect(formatPhone('+35932123456')).toBe(grouped('+359', '32123456'));
  });

  it('QA 060: groups mobile numbers in both the 8x and 9x ranges', () => {
    expect(formatPhone('+359888123456')).toBe(grouped('+359', '888', '123', '456'));
    expect(formatPhone('+359987654321')).toBe(grouped('+359', '987', '654', '321'));
  });

  it('QA 060: leaves a nine-digit number outside the mobile ranges ungrouped', () => {
    expect(formatPhone('+359700123456')).toBe(grouped('+359', '700123456'));
  });

  it('AC10: returns a value that is not a Bulgarian E.164 number unchanged', () => {
    expect(formatPhone('0899')).toBe('0899');
  });
});
