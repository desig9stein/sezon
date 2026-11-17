import type { APIRoute } from 'astro';
import { feedStylesheet } from '@components/season/feedStylesheet';

/** Media type of the feed stylesheet; `_headers` sets the same type on Cloudflare Pages. */
const XSL_MEDIA_TYPE = 'text/xsl; charset=utf-8';

/** Generates `/rss.xsl`, the stylesheet that renders `/rss.xml` as a page in browsers (spec 059). */
export const GET: APIRoute = () =>
  new Response(feedStylesheet(), { headers: { 'Content-Type': XSL_MEDIA_TYPE } });
