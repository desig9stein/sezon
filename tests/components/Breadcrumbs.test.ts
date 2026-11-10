import { describe, expect, it } from 'vitest';
import Breadcrumbs from '@components/layout/Breadcrumbs.astro';
import { jsonLdBlocks, render } from './render';

const items = [
  { name: 'Начало', path: '/' },
  { name: 'Ноември', path: '/sezon/noemvri' },
  { name: 'Зеле', path: '/zelenchutsi/zele' },
];

describe('Breadcrumbs', () => {
  it('AC9: renders an ordered list inside a labelled nav', async () => {
    const html = await render(Breadcrumbs, { items });
    expect(html).toMatch(/<nav[^>]*aria-label="Път до страницата"/);
    expect(html).toMatch(/<ol\b/);
    expect(html.match(/<li\b/g)).toHaveLength(3);
  });

  it('AC9: links all but the last item and marks the last as current', async () => {
    const html = await render(Breadcrumbs, { items });
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Начало<\/a>/);
    expect(html).toMatch(/<a[^>]*href="\/sezon\/noemvri"[^>]*>Ноември<\/a>/);
    expect(html).not.toMatch(/<a[^>]*href="\/zelenchutsi\/zele"/);
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>Зеле<\/span>/);
  });

  it('AC9: emits BreadcrumbList JSON-LD', async () => {
    const html = await render(Breadcrumbs, { items });
    const [block] = jsonLdBlocks(html) as { '@type': string; itemListElement: unknown[] }[];
    expect(block?.['@type']).toBe('BreadcrumbList');
    expect(block?.itemListElement).toHaveLength(3);
  });
});
