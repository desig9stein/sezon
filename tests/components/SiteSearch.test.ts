import { describe, expect, it } from 'vitest';
import SiteSearch from '@components/search/SiteSearch.astro';
import { render } from './render';

const browse = [
  { href: '/plodove', label: 'Плодове' },
  { href: '/kalendar', label: 'Сезонен календар' },
];

describe('SiteSearch', () => {
  it('AC3: renders a labelled GET search form, an empty status and results, browse links and a noscript note', async () => {
    const html = await render(SiteSearch, { browse });

    expect(html).toMatch(/<search[\s>][\s\S]*<form[^>]*method="get"[^>]*>[\s\S]*<\/search>/);
    expect(html).toMatch(/<form[^>]*action="\/tarsene"/);
    const input = html.match(/<input[^>]*type="search"[^>]*>/)?.[0] ?? '';
    expect(input).toMatch(/name="q"/);
    const id = input.match(/id="([^"]+)"/)?.[1];
    expect(html).toMatch(new RegExp(`<label[^>]*for="${id ?? 'missing'}"[^>]*>[^<]+</label>`));
    const hintId = input.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(html).toMatch(new RegExp(`id="${hintId ?? 'missing'}"[^>]*>[^<]*yabalki`));
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*>\s*Търси\s*<\/button>/);
    expect(html).toMatch(/<p[^>]*role="status"[^>]*>\s*<\/p>/);
    expect(html).toMatch(/<ol[^>]*data-search-results[^>]*>\s*<\/ol>/);
    expect(html).toMatch(/<noscript>[\s\S]*JavaScript[\s\S]*<\/noscript>/);
    for (const link of browse) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.label);
    }
  });
});
