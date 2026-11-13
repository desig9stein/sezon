import { calendarDayIn, isoDay, isUtcMidnight } from '@shared/domain/calendarDay';
import { isHttpsUrl } from '@shared/domain/contact';
import { InvalidSponsorError } from '@shared/domain/errors';
import type { ImageAsset } from '@shared/domain/ImageAsset';
import { SLUG_PATTERN } from '@shared/domain/Slug';
import { isAdPlacement, type AdPlacement } from './AdPlacement';

/** Input for {@link Sponsor.create}. */
export interface SponsorInput {
  readonly id: string;
  readonly name: string;
  readonly image: ImageAsset;
  readonly alt: string;
  readonly url: string;
  readonly placement: AdPlacement;
  /** First day of the campaign, a date without time stored as UTC midnight. */
  readonly from: Date;
  /** Last day of the campaign, a date without time stored as UTC midnight. */
  readonly to: Date;
}

/** A direct sponsor's banner shown in one ad placement between two calendar days. */
export class Sponsor {
  readonly id: string;
  readonly name: string;
  readonly image: ImageAsset;
  readonly alt: string;
  readonly url: string;
  readonly placement: AdPlacement;
  private readonly fromEpochMs: number;
  private readonly toEpochMs: number;

  private constructor(input: SponsorInput) {
    this.id = input.id;
    this.name = input.name;
    this.image = Object.freeze({ ...input.image });
    this.alt = input.alt;
    this.url = input.url;
    this.placement = input.placement;
    this.fromEpochMs = input.from.getTime();
    this.toEpochMs = input.to.getTime();
    Object.freeze(this);
  }

  /** First day of the campaign (UTC midnight). Returns a new `Date` on every call. */
  get from(): Date {
    return new Date(this.fromEpochMs);
  }

  /** Last day of the campaign (UTC midnight). Returns a new `Date` on every call. */
  get to(): Date {
    return new Date(this.toEpochMs);
  }

  /**
   * Creates a sponsor.
   * @throws InvalidSponsorError when the id is not a slug, the name or alt is blank, the URL is
   * not HTTPS, the placement is unknown, the image has no positive size, a date is invalid or has
   * a time of day (it must be UTC midnight), or `to` is before `from`.
   */
  static create(input: SponsorInput): Sponsor {
    const problem = findProblem(input);
    if (problem !== undefined) {
      throw new InvalidSponsorError(`Sponsor "${input.id}" ${problem}.`);
    }
    return new Sponsor(input);
  }

  /**
   * Returns `true` when the calendar day of `date` in `timeZone` is between `from` and `to`,
   * both included.
   * @param timeZone - IANA time zone; defaults to Europe/Sofia.
   */
  isActiveOn(date: Date, timeZone?: string): boolean {
    const day = calendarDayIn(date, timeZone);
    return isoDay(this.from) <= day && day <= isoDay(this.to);
  }
}

function findProblem(input: SponsorInput): string | undefined {
  if (!SLUG_PATTERN.test(input.id)) return 'has an id that is not a slug';
  if (input.name.trim() === '') return 'has a blank name';
  if (input.alt.trim() === '') return 'has a blank alt text';
  if (!isHttpsUrl(input.url)) return `has a URL that is not HTTPS: ${input.url}`;
  if (!isAdPlacement(input.placement)) return `has an unknown placement "${input.placement}"`;
  if (!(input.image.width > 0 && input.image.height > 0)) return 'has an image without a size';
  if (!isUtcMidnight(input.from) || !isUtcMidnight(input.to)) {
    return 'has a date that is invalid or not a whole day (UTC midnight)';
  }
  if (isoDay(input.to) < isoDay(input.from)) return 'ends before it starts';
  return undefined;
}
