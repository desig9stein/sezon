import { absoluteUrl } from './pageMeta';

const SITEMAP_PATH = '/sitemap-index.xml';

/** Returns robots.txt content that allows all crawlers and references the sitemap index. */
export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, SITEMAP_PATH)}\n`;
}
