import { describe, expect, it } from 'vitest';
import BaseLayout from '@layouts/BaseLayout.astro';
import { render } from './render';

describe('BaseLayout (spec 012)', () => {
  it('AC4: preloads exactly the two Cyrillic upright font files', async () => {
    const html = await render(BaseLayout, {
      title: 'Сезон',
      description:
        'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купите и как да ги приготвите.',
      path: '/',
    });

    const preloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*>/g)].map((m) => m[0]);
    expect(preloads).toHaveLength(2);
    for (const link of preloads) {
      expect(link).toContain('as="font"');
      expect(link).toContain('type="font/woff2"');
      expect(link).toMatch(/crossorigin/);
    }
    expect(html).toMatch(/@font-face/);
  });
});
