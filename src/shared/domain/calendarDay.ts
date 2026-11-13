import { InvalidTimeZoneError } from './errors';

/** IANA time zone of the site's audience (Bulgaria). */
export const DEFAULT_TIME_ZONE = 'Europe/Sofia';

/** Milliseconds in one UTC day. */
export const MS_PER_DAY = 86_400_000;

const ISO_DATE_LENGTH = 10;

const dayFormatters = new Map<string, Intl.DateTimeFormat>();

function dayFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = dayFormatters.get(timeZone);
  if (cached !== undefined) return cached;
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dayFormatters.set(timeZone, formatter);
    return formatter;
  } catch {
    throw new InvalidTimeZoneError(`"${timeZone}" is not a supported time zone.`);
  }
}

/**
 * Returns the calendar day of `date` in `timeZone` as `YYYY-MM-DD`.
 * @throws InvalidTimeZoneError when `timeZone` is not supported.
 */
export function calendarDayIn(date: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  return dayFormatter(timeZone).format(date);
}

/** Returns the UTC calendar day of `date` as `YYYY-MM-DD`, e.g. for a date stored as UTC midnight. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, ISO_DATE_LENGTH);
}

/** Returns `true` when `date` is valid and has no time of day in UTC (a date without time). */
export function isUtcMidnight(date: Date): boolean {
  return date.getTime() % MS_PER_DAY === 0;
}
