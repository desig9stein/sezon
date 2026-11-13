import { isHttpsUrl } from '@shared/domain/contact';
import { InvalidRegionProfileError } from '@shared/domain/errors';
import { frozenRecords } from '@shared/domain/freeze';

/** Most top fruits a profile lists. */
export const MAX_TOP_FRUITS = 2;

/** A citation for the profile figures: a human-readable name and an https URL. */
export interface RegionSource {
  readonly name: string;
  readonly url: string;
}

/** A fruit species with one of the largest planted areas in a province. */
export interface TopFruit {
  /** Bulgarian plural with the definite article, as it reads inside a sentence („черешите“). */
  readonly name: string;
  readonly areaHa: number;
}

/** Input for {@link RegionProfile.create}. */
export interface RegionProfileInput {
  readonly utilisedAreaHa: number;
  readonly arableHa: number;
  readonly grasslandHa: number;
  readonly topFruits: ReadonlyArray<TopFruit>;
  readonly sources: ReadonlyArray<RegionSource>;
}

/** Official agricultural figures of a province: farmland use and the largest fruit species. */
export class RegionProfile {
  /** Utilised agricultural area, in hectares. */
  readonly utilisedAreaHa: number;
  /** Arable land, in hectares. */
  readonly arableHa: number;
  /** Permanent grassland (pastures and meadows), in hectares. */
  readonly grasslandHa: number;
  /** One or two fruit species with the largest area, in descending order of area. */
  readonly topFruits: ReadonlyArray<TopFruit>;
  readonly sources: ReadonlyArray<RegionSource>;

  private constructor(input: RegionProfileInput) {
    this.utilisedAreaHa = input.utilisedAreaHa;
    this.arableHa = input.arableHa;
    this.grasslandHa = input.grasslandHa;
    this.topFruits = frozenRecords(input.topFruits);
    this.sources = frozenRecords(input.sources);
    Object.freeze(this);
  }

  /**
   * Creates a validated profile.
   * @throws InvalidRegionProfileError when an area is not positive, arable land and grassland
   * exceed the utilised area, the top fruits are not one or two in descending order, or there is
   * no source or a source is not HTTPS.
   */
  static create(input: RegionProfileInput): RegionProfile {
    const areas = [
      input.utilisedAreaHa,
      input.arableHa,
      input.grasslandHa,
      ...input.topFruits.map((fruit) => fruit.areaHa),
    ];
    if (!areas.every(isPositiveArea)) {
      throw new InvalidRegionProfileError('Every area must be a finite number above zero.');
    }
    if (input.arableHa + input.grasslandHa > input.utilisedAreaHa) {
      throw new InvalidRegionProfileError(
        'Arable land and grassland exceed the utilised agricultural area.',
      );
    }
    assertTopFruits(input.topFruits);
    if (input.sources.length === 0 || !input.sources.every((source) => isHttpsUrl(source.url))) {
      throw new InvalidRegionProfileError('A profile needs at least one source, all HTTPS.');
    }
    return new RegionProfile(input);
  }

  /** The share of the utilised area that is arable land (0–1). */
  get arableShare(): number {
    return this.arableHa / this.utilisedAreaHa;
  }

  /** The share of the utilised area that is permanent grassland (0–1). */
  get grasslandShare(): number {
    return this.grasslandHa / this.utilisedAreaHa;
  }
}

const isPositiveArea = (value: number): boolean => Number.isFinite(value) && value > 0;

/** @throws InvalidRegionProfileError unless there are one or two named fruits, largest first. */
function assertTopFruits(fruits: ReadonlyArray<TopFruit>): void {
  if (fruits.length === 0 || fruits.length > MAX_TOP_FRUITS) {
    throw new InvalidRegionProfileError(`A profile lists 1–${MAX_TOP_FRUITS} top fruits.`);
  }
  if (fruits.some((fruit) => fruit.name.trim() === '')) {
    throw new InvalidRegionProfileError('A top fruit needs a name.');
  }
  const ascending = fruits.some((fruit, index) => {
    const previous = fruits[index - 1];
    return previous !== undefined && fruit.areaHa > previous.areaHa;
  });
  if (ascending) {
    throw new InvalidRegionProfileError('Top fruits must be in descending order of area.');
  }
}
