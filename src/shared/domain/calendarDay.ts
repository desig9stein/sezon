import { InvalidTimeZoneError } from './errors';

/** IANA time zone of the site's audience (Bulgaria). */
export const DEFAULT_TIME_ZONE = 'Europe/Sofia';

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
