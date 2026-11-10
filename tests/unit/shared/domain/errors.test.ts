import { describe, expect, it } from 'vitest';
import {
  DomainError,
  InvalidMonthError,
  InvalidSeasonCalendarError,
  InvalidSeasonLevelError,
  InvalidSlugError,
} from '@shared/domain/errors';

describe('domain errors', () => {
  it.each([
    [new InvalidSlugError('x'), 'INVALID_SLUG'],
    [new InvalidMonthError('x'), 'INVALID_MONTH'],
    [new InvalidSeasonLevelError('x'), 'INVALID_SEASON_LEVEL'],
    [new InvalidSeasonCalendarError('x'), 'INVALID_SEASON_CALENDAR'],
  ])('AC14: %o extends DomainError with code %s', (error, code) => {
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(code);
    expect(error.name).toBe(error.constructor.name);
    expect(error.message).toBe('x');
  });
});
