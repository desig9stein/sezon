/** Base class for all domain rule violations. `code` is a stable machine-readable identifier. */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Thrown when a value cannot be turned into a valid URL slug. */
export class InvalidSlugError extends DomainError {
  readonly code = 'INVALID_SLUG';
}

/** Thrown when a value is not a calendar month 1–12 or a known month slug. */
export class InvalidMonthError extends DomainError {
  readonly code = 'INVALID_MONTH';
}

/** Thrown when a value is not a known season level. */
export class InvalidSeasonLevelError extends DomainError {
  readonly code = 'INVALID_SEASON_LEVEL';
}

/** Thrown when season calendar entries are empty or contain duplicate months. */
export class InvalidSeasonCalendarError extends DomainError {
  readonly code = 'INVALID_SEASON_CALENDAR';
}

/** Thrown when a time zone identifier is not supported by the runtime. */
export class InvalidTimeZoneError extends DomainError {
  readonly code = 'INVALID_TIME_ZONE';
}
