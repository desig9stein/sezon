import { routes } from '@components/layout/routes';
import { yearInTimeZone } from '@composition/clock';
import type { SeasonOverview } from '@contexts/catalog';
import { DEFAULT_TIME_ZONE, type Month } from '@contexts/seasonality';
import { ui } from '@i18n/bg';
import { absoluteUrl } from '@shared/seo';

const FEED_LANGUAGE = 'bg';
const FIRST_DAY = 1;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const UTC_OFFSET_PATTERN = /GMT([+-])(\d{2}):(\d{2})/;

/** One RSS item: the month page, its title, a plain-text summary and its publication date. */
export interface MonthlyFeedItem {
  readonly title: string;
  readonly link: string;
  readonly description: string;
  readonly pubDate: Date;
}

/** Channel metadata of the monthly RSS feed. */
export interface MonthlyFeedChannel {
  readonly title: string;
  readonly description: string;
  /** Absolute URL of the home page. */
  readonly link: string;
  readonly language: string;
  /** Absolute URL of the feed itself, for `atom:link rel="self"`. */
  readonly selfUrl: string;
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
 * Returns the publication date of a month's feed item: 00:00 on the first day of `month` in
 * `timeZone`, in the year of `now` when that moment is not after `now`, otherwise a year earlier.
 * @param now - Build time.
 * @param timeZone - IANA time zone; defaults to Europe/Sofia.
 */
export function feedPubDate(month: Month, now: Date, timeZone: string = DEFAULT_TIME_ZONE): Date {
  const year = yearInTimeZone(now, timeZone);
  const start = monthStart(year, month, timeZone);
  return start.getTime() <= now.getTime() ? start : monthStart(year - 1, month, timeZone);
}

/**
 * Returns one RSS item per overview, linking to its month page and naming its peak produce,
 * ordered by publication date, newest first.
 * @param siteUrl - Site origin.
 * @param now - Build time.
 */
export function monthlyFeedItems(
  overviews: ReadonlyArray<SeasonOverview>,
  siteUrl: string,
  now: Date,
): ReadonlyArray<MonthlyFeedItem> {
  return overviews
    .map(({ month, peak }) => ({
      title: ui.monthPage.title(month),
      link: absoluteUrl(siteUrl, routes.month(month)),
      description: ui.feed.itemDescription(
        month,
        peak.map((produce) => produce.name),
      ),
      pubDate: feedPubDate(month, now),
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/** Returns the channel metadata of the monthly RSS feed for the site at `siteUrl`. */
export function monthlyFeedChannel(siteUrl: string): MonthlyFeedChannel {
  return {
    title: ui.feed.title,
    description: ui.feed.description,
    link: absoluteUrl(siteUrl, routes.home),
    language: FEED_LANGUAGE,
    selfUrl: absoluteUrl(siteUrl, routes.feed),
  };
}
