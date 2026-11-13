import { describe, expect, it } from 'vitest';
import { siteOgCard } from '@components/seo/ogImage';
import BaseLayout from '@layouts/BaseLayout.astro';
import { render } from './render';

const props = {
  title: 'Какво е в сезон през ноември',
  description:
    'Какво е в сезон в България през ноември: зеле, праз и спанак. Виж кое е в разгара си и кое идва скоро.',
  path: '/sezon/noemvri',
};

/** Returns the `<head>` of a rendered page. */
async function head(extra: Record<string, unknown> = {}): Promise<string> {
  const html = await render(BaseLayout, { ...props, ...extra }, { default: '<h1>x</h1>' });
  return html.slice(0, html.indexOf('</head>'));
}

describe('BaseLayout (spec 050)', () => {
  it('AC7: links the site card by default, with type, size, alt and a large Twitter card', async () => {
    const html = await head();
    expect(html).toContain(
      '<meta property="og:image" content="https://sezon.example/og/site.png">',
    );
    expect(html).toContain('<meta property="og:image:type" content="image/png">');
    expect(html).toContain('<meta property="og:image:width" content="1200">');
    expect(html).toContain('<meta property="og:image:height" content="630">');
    expect(html).toContain(`<meta property="og:image:alt" content="${siteOgCard().alt}">`);
    expect(html).toContain(`<meta name="twitter:image:alt" content="${siteOgCard().alt}">`);
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html.match(/property="og:image"/g)).toHaveLength(1);
  });

  it('AC7: uses the given image path and alt', async () => {
    const html = await head({
      ogImage: { path: '/og/sezon/noemvri.png', alt: 'Какво е в сезон през ноември' },
    });
    expect(html).toContain(
      '<meta property="og:image" content="https://sezon.example/og/sezon/noemvri.png">',
    );
    expect(html).toContain('<meta property="og:image:alt" content="Какво е в сезон през ноември">');
    expect(html).toContain(
      '<meta name="twitter:image:alt" content="Какво е в сезон през ноември">',
    );
  });

  it('AC11: adds the version of a card to its meta URL', async () => {
    const html = await head({
      ogImage: { path: '/og/plodove/yabalki.png', alt: 'Ябълки', version: 'noemvri' },
    });
    expect(html).toContain(
      '<meta property="og:image" content="https://sezon.example/og/plodove/yabalki.png?m=noemvri">',
    );
  });
});
