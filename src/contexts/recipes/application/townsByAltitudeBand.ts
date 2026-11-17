import type { AltitudeProcessing } from '../domain/Recipe';

/** A town with the altitude group it lies in; `toMetres` is absent for an open top group. */
export interface AltitudeTown {
  readonly name: string;
  readonly fromMetres: number;
  readonly toMetres?: number | undefined;
}

/** One water-bath band: from `fromMetres` up to `toMetres` (open above the last band). */
export interface AltitudeBand {
  readonly fromMetres: number;
  readonly toMetres: number | undefined;
  readonly minutes: number;
}

/** A band with the towns whose whole altitude group lies in it. */
export interface AltitudeBandTowns extends AltitudeBand {
  readonly towns: ReadonlyArray<AltitudeTown>;
}

/** A town whose altitude group reaches into more than one band, with those bands. */
export interface SpanningTown {
  readonly town: AltitudeTown;
  readonly bands: ReadonlyArray<AltitudeBand>;
}

/** Towns sorted into the water-bath bands of a recipe. */
export interface TownsByAltitudeBand {
  readonly bands: ReadonlyArray<AltitudeBandTowns>;
  readonly spanning: ReadonlyArray<SpanningTown>;
}

const SEA_LEVEL = 0;

/** Returns `true` when some altitude of `town` lies in `band`. */
function touches(town: AltitudeTown, band: AltitudeBand): boolean {
  const reachesBand = town.toMetres === undefined || town.toMetres >= band.fromMetres;
  const startsBelowEnd = band.toMetres === undefined || town.fromMetres < band.toMetres;
  return reachesBand && startsBelowEnd;
}

/**
 * Sorts towns into the water-bath bands of a recipe: the lowest band (from sea level, with
 * `processingMinutes`) and one band per entry of `higherBands`. A town is listed under a band when
 * its whole altitude group lies in it, and among `spanning` when its group reaches into two or more
 * bands. Towns keep the given order.
 * @param processingMinutes - Minutes of the lowest band.
 * @param higherBands - Higher bands, each from its `fromMetres`, in increasing order.
 * @param towns - Towns with their altitude groups.
 */
export function townsByAltitudeBand(
  processingMinutes: number,
  higherBands: ReadonlyArray<AltitudeProcessing>,
  towns: ReadonlyArray<AltitudeTown>,
): TownsByAltitudeBand {
  const starts = [{ fromMetres: SEA_LEVEL, minutes: processingMinutes }, ...higherBands];
  const bands: ReadonlyArray<AltitudeBand> = starts.map((band, index) =>
    Object.freeze({
      fromMetres: band.fromMetres,
      toMetres: starts[index + 1]?.fromMetres,
      minutes: band.minutes,
    }),
  );
  const touched = towns.map((town) => ({
    town,
    bands: bands.filter((band) => touches(town, band)),
  }));
  return Object.freeze({
    bands: Object.freeze(
      bands.map((band) =>
        Object.freeze({
          ...band,
          towns: Object.freeze(
            touched
              .filter((entry) => entry.bands.length === 1 && entry.bands[0] === band)
              .map((entry) => entry.town),
          ),
        }),
      ),
    ),
    spanning: Object.freeze(
      touched
        .filter((entry) => entry.bands.length > 1)
        .map((entry) => Object.freeze({ town: entry.town, bands: Object.freeze(entry.bands) })),
    ),
  });
}
