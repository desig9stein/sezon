import { describe, expect, it } from 'vitest';
import SiteHeader from '@components/layout/SiteHeader.astro';
import { render } from './render';

describe('SiteHeader search link', () => {
  it('AC5: ends the main navigation with a link to the search page', async () => {
    const html = await render(SiteHeader, { currentPath: '/' });
    const links = [...html.matchAll(/<a href="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/g)];
    const last = links.at(-1);
    expect(last?.[1]).toBe('/tarsene');
    expect(last?.[2]).toBe('Търсене');
  });
});
