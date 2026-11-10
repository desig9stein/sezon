import { DEFAULT_TIME_ZONE, Month } from '@contexts/seasonality';

/**
 * Returns the calendar year of `date` in `timeZone`.
 * @param timeZone - IANA time zone; defaults to Europe/Sofia.
 */
export function yearInTimeZone(date: Date, timeZone: string = DEFAULT_TIME_ZONE): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(date));
}

/** Moment at which the static site was generated. */
export const BUILD_DATE = new Date();

/** Calendar month in Europe/Sofia at build time. */
export const buildMonth: Month = Month.fromDate(BUILD_DATE);

/** Calendar year in Europe/Sofia at build time. */
export const buildYear: number = yearInTimeZone(BUILD_DATE);
