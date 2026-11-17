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

  it('AC10: groups another eight-digit number as +359 XX XXX XXX', () => {
    expect(formatPhone('+35932123456')).toBe(grouped('+359', '32', '123', '456'));
  });

  it('AC10: returns a value that is not a Bulgarian E.164 number unchanged', () => {
    expect(formatPhone('0899')).toBe('0899');
  });
});
