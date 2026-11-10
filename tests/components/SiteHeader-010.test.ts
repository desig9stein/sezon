import { describe, expect, it } from 'vitest';
import SiteHeader from '@components/layout/SiteHeader.astro';
import { render } from './render';

const linkOrder = (html: string) =>
  [...html.matchAll(/<nav[^>]*>[\s\S]*?<\/nav>/g)].flatMap((nav) =>
    [...(nav[0] ?? '').matchAll(/href="([^"]+)"/g)].map((m) => m[1]),
  );

describe('SiteHeader (spec 010)', () => {
  it('AC7: links to the four sections after the season links', async () => {
    const html = await render(SiteHeader, { currentPath: '/' });

    expect(linkOrder(html).slice(-4)).toEqual(['/plodove', '/zelenchutsi', '/podpravki', '/yadki']);
    expect(html).toContain('>Зеленчуци<');
  });

  it('AC7: marks the current section page with aria-current="page"', async () => {
    const html = await render(SiteHeader, { currentPath: '/zelenchutsi' });

    expect(html).toMatch(/href="\/zelenchutsi"[^>]*aria-current="page"/);
  });

  it('AC7: marks the section of a produce page with aria-current="true"', async () => {
    const html = await render(SiteHeader, { currentPath: '/zelenchutsi/zele' });

    expect(html).toMatch(/href="\/zelenchutsi"[^>]*aria-current="true"/);
    expect(html).not.toMatch(/aria-current="page"/);
  });
});
