import { DEFAULT_TIME_ZONE, Month } from '@contexts/seasonality';

const FIRST_DAY = 1;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const UTC_OFFSET_PATTERN = /GMT([+-])(\d{2}):(\d{2})/;

/**
 * Returns the calendar year of `date` in `timeZone`.
 * @param timeZone - IANA time zone; defaults to Europe/Sofia.
 */
export function yearInTimeZone(date: Date, timeZone: string = DEFAULT_TIME_ZONE): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(date));
}

/** Returns the UTC offset of `timeZone` at `date`, in milliseconds (positive east of UTC). */
function utcOffsetMs(date: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = UTC_OFFSET_PATTERN.exec(name ?? '');
  if (match === null) {
    return 0;
  }
  const [, sign, hours = '0', minutes = '0'] = match;
  const offset = (Number(hours) * MINUTES_PER_HOUR + Number(minutes)) * MS_PER_MINUTE;
  return sign === '-' ? -offset : offset;
}

/** Returns 00:00 on the first day of `month` in `year`, local time in `timeZone`. */
function monthStart(year: number, month: Month, timeZone: string): Date {
  const utcMidnight = Date.UTC(year, month.number - 1, FIRST_DAY);
  const guess = utcMidnight - utcOffsetMs(new Date(utcMidnight), timeZone);
  return new Date(utcMidnight - utcOffsetMs(new Date(guess), timeZone));
}

/**
 * Returns 00:00 on the first day of `month`, local time in `timeZone`, in the year of `now` when
 * that moment is not after `now`, otherwise a year earlier.
 * @param timeZone - IANA time zone; defaults to Europe/Sofia.
 */
export function latestMonthStart(
  month: Month,
  now: Date,
  timeZone: string = DEFAULT_TIME_ZONE,
): Date {
  const year = yearInTimeZone(now, timeZone);
  const start = monthStart(year, month, timeZone);
  return start.getTime() <= now.getTime() ? start : monthStart(year - 1, month, timeZone);
}

/** Moment at which the static site was generated. */
export const BUILD_DATE = new Date();

/** Calendar month in Europe/Sofia at build time. */
export const buildMonth: Month = Month.fromDate(BUILD_DATE);

/** Calendar year in Europe/Sofia at build time. */
export const buildYear: number = yearInTimeZone(BUILD_DATE);
