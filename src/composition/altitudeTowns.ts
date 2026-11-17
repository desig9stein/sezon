import type { RegionRepository, RegionSource } from '@contexts/geography';
import type { AltitudeTown } from '@contexts/recipes';

/** The province seats as towns with their altitude groups, and the source of those groups. */
export interface ProvinceSeatTowns {
  readonly towns: ReadonlyArray<AltitudeTown>;
  readonly source: RegionSource;
}

const COLLATOR = new Intl.Collator('bg');

/**
 * Returns the seat of every region that has one, as a town with its altitude group, sorted by
 * name, with the source of the first seat (all seats cite the same register, spec 061).
 * @returns `undefined` when no region has a seat.
 */
export async function provinceSeatTowns(
  regions: RegionRepository,
): Promise<ProvinceSeatTowns | undefined> {
  const seats = (await regions.all()).flatMap((region) =>
    region.seat === undefined ? [] : [region.seat],
  );
  const [first] = seats;
  if (first === undefined) return undefined;
  const towns = seats
    .map((seat) =>
      Object.freeze({
        name: seat.town,
        fromMetres: seat.altitude.fromMetres,
        toMetres: seat.altitude.toMetres,
      }),
    )
    .sort((a, b) => COLLATOR.compare(a.name, b.name));
  return Object.freeze({ towns: Object.freeze(towns), source: first.source });
}
