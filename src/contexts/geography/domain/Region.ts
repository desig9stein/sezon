import type { RegionProfile } from './RegionProfile';

/** Input for {@link Region.create}. */
export interface RegionInput {
  readonly slug: string;
  readonly name: string;
  readonly profile?: RegionProfile | undefined;
}

/** One of the 28 provinces (oblasti) of Bulgaria. */
export class Region {
  readonly slug: string;
  readonly name: string;
  /** Official agricultural figures, when the site has them. */
  readonly profile: RegionProfile | undefined;

  private constructor(input: RegionInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.profile = input.profile;
    Object.freeze(this);
  }

  /** Creates a region. */
  static create(input: RegionInput): Region {
    return new Region(input);
  }
}
