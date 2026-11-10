import { frozenList } from '@shared/domain/freeze';
import type { ContactInfo } from './ContactInfo';

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
    Object.freeze(this);
  }

  /** Creates a farm. */
  static create(input: FarmInput): Farm {
    return new Farm(input);
  }

  /** Returns `true` when the farm lists `produceSlug` among the produce it sells. */
  sells(produceSlug: string): boolean {
    return this.produceSlugs.includes(produceSlug);
  }
}
