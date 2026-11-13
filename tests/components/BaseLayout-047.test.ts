import { describe, expect, it } from 'vitest';
import BaseLayout from '@layouts/BaseLayout.astro';
import { render } from './render';

const props = {
  title: 'Какво е в сезон през ноември',
  description:
    'Какво е в сезон в България през ноември: зеле, праз и спанак. Виж кое е в разгара си и кое идва скоро.',
  path: '/sezon/noemvri',
};

describe('BaseLayout (spec 047)', () => {
  it('AC6: links the RSS feed from the head with its title and absolute URL', async () => {
    const html = await render(BaseLayout, props, { default: '<h1>x</h1>' });
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).toContain(
      '<link rel="alternate" type="application/rss+xml" title="Сезон – какво е в сезон в България" href="https://sezon.example/rss.xml">',
    );
  });
});
