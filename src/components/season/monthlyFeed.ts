import { routes } from '@components/layout/routes';
import { latestMonthStart, yearInTimeZone } from '@composition/clock';
import type { SeasonOverview } from '@contexts/catalog';
import { ui } from '@i18n/bg';
import { absoluteUrl } from '@shared/seo';

const FEED_LANGUAGE = 'bg';

/** One RSS item: the month page, its title, a plain-text summary and its publication date. */
export interface MonthlyFeedItem {
  readonly title: string;
  readonly link: string;
  /** Not a permalink: the link, `#` and the Europe/Sofia year of `pubDate`. */
  readonly guid: string;
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
    .map(({ month, peak }) => {
      const link = absoluteUrl(siteUrl, routes.month(month));
      const pubDate = latestMonthStart(month, now);
      return {
        title: ui.monthPage.title(month),
        link,
        guid: `${link}#${yearInTimeZone(pubDate)}`,
        description: ui.feed.itemDescription(
          month,
          peak.map((produce) => produce.name),
        ),
        pubDate,
      };
    })
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
