import { describe, expect, it } from 'vitest';
import SiteFooter from '@components/layout/SiteFooter.astro';
import { render } from './render';

describe('SiteFooter (spec 047)', () => {
  it('AC7 (amended by spec 059 AC7): links the RSS feed from the „Следи сезона“ paragraph', async () => {
    const html = await render(SiteFooter, { path: '/' });
    const follow = /<p[^>]*class="site-footer__follow"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(follow).toContain('Следи сезона');
    expect(follow).toMatch(/<a[^>]*href="\/rss\.xml"[^>]*>\s*RSS абонамент\s*<\/a>/);
  });
});
