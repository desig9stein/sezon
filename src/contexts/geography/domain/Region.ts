import type { RegionProfile, RegionSource } from './RegionProfile';

/** The altitude group of a town, in metres; `toMetres` is absent for an open top group. */
export interface AltitudeGroup {
  readonly fromMetres: number;
  readonly toMetres?: number | undefined;
}

/** The administrative seat of a province and the altitude group it is registered in. */
export interface RegionSeat {
  readonly town: string;
  readonly altitude: AltitudeGroup;
  readonly source: RegionSource;
}

/** Input for {@link Region.create}. */
export interface RegionInput {
  readonly slug: string;
  readonly name: string;
  readonly profile?: RegionProfile | undefined;
  readonly seat?: RegionSeat | undefined;
}

/** One of the 28 provinces (oblasti) of Bulgaria. */
export class Region {
  readonly slug: string;
  readonly name: string;
  /** Official agricultural figures, when the site has them. */
  readonly profile: RegionProfile | undefined;
  /** The seat town and its altitude group, when the site has them (spec 061). */
  readonly seat: RegionSeat | undefined;

  private constructor(input: RegionInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.profile = input.profile;
    this.seat =
      input.seat === undefined
        ? undefined
        : Object.freeze({
            town: input.seat.town,
            altitude: Object.freeze({ ...input.seat.altitude }),
            source: Object.freeze({ ...input.seat.source }),
          });
    Object.freeze(this);
  }

  /** Creates a region. */
  static create(input: RegionInput): Region {
    return new Region(input);
  }
}
