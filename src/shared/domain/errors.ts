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

/** Thrown when nutrition values are negative, not finite, or list a nutrient twice. */
export class InvalidNutritionFactsError extends DomainError {
  readonly code = 'INVALID_NUTRITION_FACTS';
}

/** Thrown when contact information has no website, email or phone. */
export class InvalidContactInfoError extends DomainError {
  readonly code = 'INVALID_CONTACT_INFO';
}

/** Thrown when two entities in one collection share a slug. */
export class DuplicateEntityError extends DomainError {
  readonly code = 'DUPLICATE_ENTITY';
}

/** Thrown when content references an entry that does not exist. */
export class BrokenReferenceError extends DomainError {
  readonly code = 'BROKEN_REFERENCE';
}

/** Thrown when page metadata violates SEO rules (title or description length, path format). */
export class InvalidPageMetaError extends DomainError {
  readonly code = 'INVALID_PAGE_META';
}

/** Thrown when a nutrient's reference intake or an amount is not a valid non-negative number. */
export class InvalidNutrientError extends DomainError {
  readonly code = 'INVALID_NUTRIENT';
}

/** Thrown when produce data violates an entity invariant (e.g. an invalid date). */
export class InvalidProduceError extends DomainError {
  readonly code = 'INVALID_PRODUCE';
}

/** Thrown when required site configuration (e.g. Astro `site`) is missing or invalid. */
export class InvalidConfigurationError extends DomainError {
  readonly code = 'INVALID_CONFIGURATION';
}

/** Thrown when no produce exists for a requested slug. */
export class ProduceNotFoundError extends DomainError {
  readonly code = 'PRODUCE_NOT_FOUND';
}

/** Thrown when no nutrient exists for a requested slug. */
export class NutrientNotFoundError extends DomainError {
  readonly code = 'NUTRIENT_NOT_FOUND';
}

/** Thrown when no produce group exists for a requested slug. */
export class ProduceGroupNotFoundError extends DomainError {
  readonly code = 'PRODUCE_GROUP_NOT_FOUND';
}

/** Thrown when farm data violates an entity invariant (e.g. an invalid certificate date). */
export class InvalidFarmError extends DomainError {
  readonly code = 'INVALID_FARM';
}

/** Thrown when no region has the requested slug. */
export class RegionNotFoundError extends DomainError {
  readonly code = 'REGION_NOT_FOUND';
}
