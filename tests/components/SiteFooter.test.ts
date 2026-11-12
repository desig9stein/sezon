import { describe, expect, it } from 'vitest';
import SiteFooter from '@components/layout/SiteFooter.astro';
import { render } from './render';

const MONTHS: [string, string][] = [
  ['yanuari', 'Януари'],
  ['fevruari', 'Февруари'],
  ['mart', 'Март'],
  ['april', 'Април'],
  ['may', 'Май'],
  ['yuni', 'Юни'],
  ['yuli', 'Юли'],
  ['avgust', 'Август'],
  ['septemvri', 'Септември'],
  ['oktomvri', 'Октомври'],
  ['noemvri', 'Ноември'],
  ['dekemvri', 'Декември'],
];

describe('SiteFooter', () => {
  it.each(MONTHS)('AC10: links to /sezon/%s labelled %s', async (slug, name) => {
    const html = await render(SiteFooter, { path: '/' });
    expect(html).toMatch(new RegExp(`<a[^>]*href="/sezon/${slug}"[^>]*>\\s*${name}\\s*</a>`));
  });

  it('AC10: shows the health disclaimer', async () => {
    const html = await render(SiteFooter, { path: '/' });
    expect(html).toContain('не е медицински съвет');
  });
});
