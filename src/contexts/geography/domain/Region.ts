/** Input for {@link Region.create}. */
export interface RegionInput {
  readonly slug: string;
  readonly name: string;
}

/** One of the 28 provinces (oblasti) of Bulgaria. */
export class Region {
  readonly slug: string;
  readonly name: string;

  private constructor(input: RegionInput) {
    this.slug = input.slug;
    this.name = input.name;
    Object.freeze(this);
  }

  /** Creates a region. */
  static create(input: RegionInput): Region {
    return new Region(input);
  }
}
