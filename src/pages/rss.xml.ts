import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { FEED_MEDIA_TYPE } from '@components/layout/routes';
import { monthlyFeedChannel, monthlyFeedItems } from '@components/season/monthlyFeed';
import { BUILD_DATE } from '@composition/clock';
import { seasonOverviewService } from '@composition/index';
import { requireSiteUrl } from '@composition/site';
import { Month } from '@contexts/seasonality';
import { escapeXml } from '@shared/seo';

const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';

/**
 * Generates `/rss.xml`: an RSS 2.0 feed with one item per month page. Each item's guid goes in its
 * `customData`, which replaces the permalink guid `@astrojs/rss` derives from the link.
 */
export const GET: APIRoute = async ({ site }) => {
  const siteUrl = requireSiteUrl(site);
  const channel = monthlyFeedChannel(siteUrl);
  const overviews = await Promise.all(
    Month.all().map((month) => seasonOverviewService.overviewFor(month)),
  );
  return rss({
    title: channel.title,
    description: channel.description,
    site: channel.link,
    items: monthlyFeedItems(overviews, siteUrl, BUILD_DATE).map(({ guid, ...item }) => ({
      ...item,
      customData: `<guid isPermaLink="false">${escapeXml(guid)}</guid>`,
    })),
    xmlns: { atom: ATOM_NAMESPACE },
    customData: `<language>${channel.language}</language><atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="${FEED_MEDIA_TYPE}"/>`,
  });
};
