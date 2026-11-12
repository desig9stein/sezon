import { describe, expect, it } from 'vitest';
import BaseLayout from '@layouts/BaseLayout.astro';
import { render } from './render';

const props = {
  title: 'Страницата не е намерена',
  description:
    'Страницата, която търсиш, не съществува. Виж какво е в сезон сега или избери месец.',
  path: '/404',
};

describe('BaseLayout (spec 006)', () => {
  it('AC2: renders noindex without a canonical link', async () => {
    const html = await render(BaseLayout, { ...props, noindex: true }, { default: '<h1>x</h1>' });
    expect(html).toContain('<meta name="robots" content="noindex, follow">');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('og:url');
  });

  it('AC3: links the SVG favicon', async () => {
    const html = await render(BaseLayout, props, { default: '<h1>x</h1>' });
    expect(html).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
  });
});
