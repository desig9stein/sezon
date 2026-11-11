import { frozenList } from '@shared/domain/freeze';
import type { ContactInfo } from './ContactInfo';

const ISO_DATE_LENGTH = 10;

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
  readonly isPlaceholder: boolean;
  readonly sponsored: boolean;
  readonly organic?: OrganicCertificate | undefined;
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
  readonly isPlaceholder: boolean;
  readonly sponsored: boolean;
  readonly organic: OrganicCertificate | undefined;

  private constructor(input: FarmInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.regionSlug = input.regionSlug;
    this.produceSlugs = frozenList(input.produceSlugs);
    this.description = input.description;
    this.contact = input.contact;
    this.address = input.address;
    this.isPlaceholder = input.isPlaceholder;
    this.sponsored = input.sponsored;
    this.organic =
      input.organic === undefined
        ? undefined
        : Object.freeze({ ...input.organic, validUntil: new Date(input.organic.validUntil) });
    Object.freeze(this);
  }

  /** Creates a farm. */
  static create(input: FarmInput): Farm {
    return new Farm(input);
  }

  /** Returns `true` when the farm holds an organic certificate valid on the calendar day of `date`. */
  isOrganicOn(date: Date): boolean {
    if (this.organic === undefined) return false;
    const day = (value: Date) => value.toISOString().slice(0, ISO_DATE_LENGTH);
    return day(date) <= day(this.organic.validUntil);
  }

  /** Returns `true` when the farm lists `produceSlug` among the produce it sells. */
  sells(produceSlug: string): boolean {
    return this.produceSlugs.includes(produceSlug);
  }
}
