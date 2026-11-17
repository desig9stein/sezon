import { describe, expect, it } from 'vitest';
import SiteHeader from '@components/layout/SiteHeader.astro';
import { render } from './render';

const navLinks = (html: string) => {
  const nav = /<nav[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
  return [...nav.matchAll(/<a([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs = '', text = '']) => ({
    href: /href="([^"]+)"/.exec(attrs)?.[1],
    current: /aria-current="([^"]+)"/.exec(attrs)?.[1],
    text: text.replace(/<[^>]+>/g, '').trim(),
  }));
};

describe('SiteHeader (spec 023)', () => {
  it('AC2 (amended by spec 059 AC4): has exactly five links: Каталог, Календар, Ферми, Рецепти, Търсене', async () => {
    const links = navLinks(await render(SiteHeader, { currentPath: '/' }));
    expect(links.map(({ href, text }) => [href, text])).toEqual([
      ['/katalog', 'Каталог'],
      ['/kalendar', 'Календар'],
      ['/fermi', 'Ферми'],
      ['/retsepti', 'Рецепти'],
      ['/tarsene', 'Търсене'],
    ]);
  });

  it('spec 059 AC5: the logo links home and is the current page only on the home page', async () => {
    const logo = (html: string) => /<a([^>]*class="site-header__logo"[^>]*)>/.exec(html)?.[1] ?? '';
    const home = logo(await render(SiteHeader, { currentPath: '/' }));
    expect(home).toContain('href="/"');
    expect(home).toContain('aria-current="page"');
    expect(logo(await render(SiteHeader, { currentPath: '/katalog' }))).not.toContain(
      'aria-current',
    );
    const links = navLinks(await render(SiteHeader, { currentPath: '/' }));
    expect(links.filter((link) => link.current)).toEqual([]);
  });

  it.each([
    ['/plodove/yabalki', '/katalog', 'true'],
    ['/plodove', '/katalog', 'true'],
    ['/grupi/rozotsvetni', '/katalog', 'true'],
    ['/nutrienti/kaliy', '/katalog', 'true'],
    ['/sezon/noemvri', '/kalendar', 'true'],
    ['/katalog', '/katalog', 'page'],
    ['/regioni/plovdiv', '/katalog', 'true'],
    ['/fermi', '/fermi', 'page'],
    ['/fermi/venets', '/fermi', 'true'],
    ['/retsepti', '/retsepti', 'page'],
    ['/retsepti/kiselo-zele', '/retsepti', 'true'],
  ])(
    'AC3 (amended by spec 059 AC5): on %s marks %s as %s and nothing else',
    async (path, href, current) => {
      const links = navLinks(await render(SiteHeader, { currentPath: path }));
      expect(links.filter((link) => link.current).map((link) => [link.href, link.current])).toEqual(
        [[href, current]],
      );
    },
  );
});
