import { describe, expect, it } from 'vitest';
import SiteFooter from '@components/layout/SiteFooter.astro';
import { render } from './render';

describe('SiteFooter (spec 047)', () => {
  it('AC7: links the RSS feed from the „За сайта“ list, after the methodology link', async () => {
    const html = await render(SiteFooter, { path: '/' });
    const nav = /<nav[^>]*aria-label="За сайта"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    const links = [...nav.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g)].map(
      ([, href = '', text = '']) => ({ href, text: text.trim() }),
    );
    const feed = links.findIndex((link) => link.href === '/rss.xml');
    expect(links[feed]?.text).toBe('RSS абонамент');
    expect(links[feed - 1]?.href).toBe('/metodologiya');
  });
});
