import { calendarDayIn, isoDay } from '@shared/domain/calendarDay';
import { isHttpsUrl } from '@shared/domain/contact';
import { InvalidFarmError } from '@shared/domain/errors';
import { frozenList } from '@shared/domain/freeze';
import type { ContactInfo } from './ContactInfo';

/** An organic production certificate: who issued it, its number and its last valid day. */
export interface OrganicCertificate {
  readonly certifier: string;
  readonly certificateId: string;
  readonly validUntil: Date;
}

/** Input for {@link Farm.create}. */
export interface FarmInput {
  readonly slug: string;
  readonly name: string;
  readonly regionSlug: string;
  readonly produceSlugs: ReadonlyArray<string>;
  readonly description: string;
  readonly contact: ContactInfo;
  readonly address?: string | undefined;
  readonly sponsored: boolean;
  readonly organic?: OrganicCertificate | undefined;
  /** HTTPS URLs of the pages the farm's facts come from. */
  readonly sources?: ReadonlyArray<string> | undefined;
}

/** A local farm that sells produce directly. */
export class Farm {
  readonly slug: string;
  readonly name: string;
  readonly regionSlug: string;
  readonly produceSlugs: ReadonlyArray<string>;
  readonly description: string;
  readonly contact: ContactInfo;
  readonly address: string | undefined;
  readonly sponsored: boolean;
  readonly organic: OrganicCertificate | undefined;
  /** HTTPS URLs of the pages the farm's facts come from. */
  readonly sources: ReadonlyArray<string>;

  private constructor(input: FarmInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.regionSlug = input.regionSlug;
    this.produceSlugs = frozenList(input.produceSlugs);
    this.description = input.description;
    this.contact = input.contact;
    this.address = input.address;
    this.sponsored = input.sponsored;
    this.organic =
      input.organic === undefined
        ? undefined
        : Object.freeze({ ...input.organic, validUntil: new Date(input.organic.validUntil) });
    this.sources = frozenList(input.sources ?? []);
    Object.freeze(this);
  }

  /**
   * Creates a farm.
   * @throws InvalidFarmError when the organic certificate has a blank certifier or id, or an
   * invalid date, or when a source is not an HTTPS URL.
   */
  static create(input: FarmInput): Farm {
    const badSource = (input.sources ?? []).find((source) => !isHttpsUrl(source));
    if (badSource !== undefined) {
      throw new InvalidFarmError(
        `Farm "${input.slug}" has a source that is not HTTPS: ${badSource}`,
      );
    }
    const certificate = input.organic;
    if (certificate !== undefined) {
      if (certificate.certifier.trim() === '' || certificate.certificateId.trim() === '') {
        throw new InvalidFarmError(`Farm "${input.slug}" has a blank organic certifier or id.`);
      }
      if (Number.isNaN(certificate.validUntil.getTime())) {
        throw new InvalidFarmError(`Farm "${input.slug}" has an invalid certificate date.`);
      }
    }
    return new Farm(input);
  }

  /**
   * Returns `true` when the farm holds an organic certificate valid on the calendar day of `date`
   * in `timeZone`. `validUntil` is a date without time, stored as UTC midnight.
   * @param timeZone - IANA time zone; defaults to Europe/Sofia.
   */
  isOrganicOn(date: Date, timeZone?: string): boolean {
    if (this.organic === undefined) return false;
    return calendarDayIn(date, timeZone) <= isoDay(this.organic.validUntil);
  }

  /** Returns `true` when the farm lists `produceSlug` among the produce it sells. */
  sells(produceSlug: string): boolean {
    return this.produceSlugs.includes(produceSlug);
  }
}
