import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import {
  monthOgCard,
  OG_IMAGE,
  ogImageSlug,
  produceOgCard,
  siteOgCard,
} from '@components/seo/ogImage';
import { renderOgImage } from '@components/seo/ogRenderer';
import { buildMonth } from '@composition/clock';
import { produceRepository, seasonOverviewService } from '@composition/index';
import { requireSiteUrl } from '@composition/site';
import { Month } from '@contexts/seasonality';

/** Lists the site card, the 12 month cards and one card per produce (spec 050). */
export const getStaticPaths = (async () => {
  const overviews = await Promise.all(
    Month.all().map((month) => seasonOverviewService.overviewFor(month)),
  );
  const produce = await produceRepository.all();
  const cards = [
    siteOgCard(),
    ...overviews.map(monthOgCard),
    ...produce.map((item) => produceOgCard(item, buildMonth)),
  ];
  return cards.map((card) => ({ params: { slug: ogImageSlug(card.path) }, props: { card } }));
}) satisfies GetStaticPaths;

/** Writes one Open Graph image as a PNG at build time. */
export const GET: APIRoute<InferGetStaticPropsType<typeof getStaticPaths>> = async ({
  props,
  site,
}) => {
  const { card } = props;
  const png = await renderOgImage(card, requireSiteUrl(site));
  return new Response(png, { headers: { 'Content-Type': OG_IMAGE.type } });
};
