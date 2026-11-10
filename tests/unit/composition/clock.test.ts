import { describe, expect, it } from 'vitest';
import { yearInTimeZone } from '@composition/clock';

describe('yearInTimeZone', () => {
  it('QA 003: returns the Sofia year around New Year', () => {
    expect(yearInTimeZone(new Date('2026-12-31T21:59:59Z'))).toBe(2026);
    expect(yearInTimeZone(new Date('2026-12-31T22:30:00Z'))).toBe(2027);
  });
});
