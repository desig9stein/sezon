import { describe, expect, it } from 'vitest';
import SiteFooter from '@components/layout/SiteFooter.astro';
import { routes } from '@components/layout/routes';
import { buildMonth } from '@composition/clock';
import { render } from './render';

/** The month links of the footer's year strip with their attributes and text. */
const monthLinks = (html: string) => {
  const nav = /<nav[^>]*id="mesetsi"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
  return [...nav.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs = '', text = '']) => ({
    href: /href="([^"]+)"/.exec(attrs)?.[1],
    current: /aria-current="([^"]+)"/.exec(attrs)?.[1],
    text: text
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  }));
};

const otherMonth = buildMonth.next().next();

describe('SiteFooter (spec 059)', () => {
  it('AC7: links the farms, recipes and regions and explains the RSS feed', async () => {
    const html = await render(SiteFooter, { path: '/' });
    const nav = /<nav[^>]*aria-label="За сайта"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    for (const href of [routes.farms, routes.recipes, routes.regions]) {
      expect(nav).toContain(`href="${href}"`);
    }
    expect(html).toMatch(
      /class="site-footer__follow"[\s\S]*?Следи сезона[\s\S]*?href="\/rss\.xml"/,
    );
  });

  it('AC8: marks the page month as the page and labels the build month „(сега)“', async () => {
    const links = monthLinks(await render(SiteFooter, { path: routes.month(otherMonth) }));
    expect(links).toHaveLength(12);
    expect(links.filter((link) => link.current === 'page').map((link) => link.href)).toEqual([
      routes.month(otherMonth),
    ]);
    const now = links.find((link) => link.href === routes.month(buildMonth));
    expect(now?.current).toBe('date');
    expect(now?.text).toMatch(/\(сега\)$/);
    expect(links.filter((link) => link.text.includes('(сега)'))).toHaveLength(1);
  });

  it('AC8: marks no month as the page outside month pages', async () => {
    const links = monthLinks(await render(SiteFooter, { path: '/fermi' }));
    expect(links.filter((link) => link.current === 'page')).toEqual([]);
    expect(links.filter((link) => link.current === 'date')).toHaveLength(1);
  });

  it('AC8: on the build month page the build month is the page and still says „(сега)“', async () => {
    const links = monthLinks(await render(SiteFooter, { path: routes.month(buildMonth) }));
    const now = links.find((link) => link.href === routes.month(buildMonth));
    expect(now?.current).toBe('page');
    expect(now?.text).toMatch(/\(сега\)$/);
  });

  it('QA 059: links home and the subscription page', async () => {
    const html = await render(SiteFooter, { path: '/fermi' });
    const nav = /<nav[^>]*aria-label="За сайта"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    expect(nav).toMatch(/<a[^>]*href="\/"[^>]*>\s*Начало\s*<\/a>/);
    const follow = /<p[^>]*class="site-footer__follow"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(follow).toContain('href="/abonament"');
    expect(follow).toContain('href="/rss.xml"');
  });
});
