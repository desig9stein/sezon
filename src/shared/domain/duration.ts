const MINUTES_PER_HOUR = 60;

/** A number of minutes split into whole hours and the remaining minutes. */
export interface HoursAndMinutes {
  readonly hours: number;
  readonly minutes: number;
}

/**
 * Splits `totalMinutes` into whole hours and the remaining minutes (65 → 1 h 5 min).
 * @param totalMinutes - Whole minutes, zero or more.
 */
export function hoursAndMinutes(totalMinutes: number): HoursAndMinutes {
  return {
    hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
    minutes: totalMinutes % MINUTES_PER_HOUR,
  };
}
