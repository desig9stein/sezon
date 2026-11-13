import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { monthlyFeedChannel, monthlyFeedItems } from '@components/season/monthlyFeed';
import { BUILD_DATE } from '@composition/clock';
import { seasonOverviewService } from '@composition/index';
import { requireSiteUrl } from '@composition/site';
import { Month } from '@contexts/seasonality';

const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';
const RSS_MEDIA_TYPE = 'application/rss+xml';

/** Generates `/rss.xml`: an RSS 2.0 feed with one item per month page. */
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
    items: [...monthlyFeedItems(overviews, siteUrl, BUILD_DATE)],
    xmlns: { atom: ATOM_NAMESPACE },
    customData: `<language>${channel.language}</language><atom:link href="${channel.selfUrl}" rel="self" type="${RSS_MEDIA_TYPE}"/>`,
  });
};
