import type { APIRoute } from 'astro';
import { requireSiteUrl } from '@composition/site';
import { robotsTxt } from '@shared/seo';

/** Generates `/robots.txt` from the configured site URL. */
export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(requireSiteUrl(site)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
