import { describe, expect, it } from 'vitest';
import { isoDay, isUtcMidnight, MS_PER_DAY } from '@shared/domain/calendarDay';

describe('calendar day helpers (QA 037)', () => {
  it('QA 037: isoDay returns the UTC day of a date as YYYY-MM-DD', () => {
    expect(isoDay(new Date('2026-12-01'))).toBe('2026-12-01');
    expect(isoDay(new Date('2026-12-01T23:30:00Z'))).toBe('2026-12-01');
  });

  it('QA 037: isUtcMidnight accepts only dates without a time of day', () => {
    expect(MS_PER_DAY).toBe(86_400_000);
    expect(isUtcMidnight(new Date('2026-12-01'))).toBe(true);
    expect(isUtcMidnight(new Date('2026-12-01T00:00:00+02:00'))).toBe(false);
    expect(isUtcMidnight(new Date('2026-12-01T00:00:01Z'))).toBe(false);
    expect(isUtcMidnight(new Date('nope'))).toBe(false);
  });
});
