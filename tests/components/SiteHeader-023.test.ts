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
  it('AC2: has exactly four links: Сега, Каталог, Календар, Търсене', async () => {
    const links = navLinks(await render(SiteHeader, { currentPath: '/' }));
    expect(links.map(({ href, text }) => [href, text])).toEqual([
      ['/', 'Сега'],
      ['/katalog', 'Каталог'],
      ['/kalendar', 'Календар'],
      ['/tarsene', 'Търсене'],
    ]);
  });

  it.each([
    ['/plodove/yabalki', '/katalog', 'true'],
    ['/plodove', '/katalog', 'true'],
    ['/grupi/rozotsvetni', '/katalog', 'true'],
    ['/nutrienti/kaliy', '/katalog', 'true'],
    ['/sezon/noemvri', '/kalendar', 'true'],
    ['/katalog', '/katalog', 'page'],
    ['/', '/', 'page'],
  ])('AC3: on %s marks %s as %s and nothing else', async (path, href, current) => {
    const links = navLinks(await render(SiteHeader, { currentPath: path }));
    expect(links.filter((link) => link.current).map((link) => [link.href, link.current])).toEqual([
      [href, current],
    ]);
  });
});
