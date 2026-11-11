import { describe, expect, it } from 'vitest';
import BaseLayout from '@layouts/BaseLayout.astro';
import { render } from './render';

describe('BaseLayout (spec 012)', () => {
  it('AC4: preloads exactly the four upright font files', async () => {
    const html = await render(BaseLayout, {
      title: 'Сезон',
      description:
        'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купите и как да ги приготвите.',
      path: '/',
    });

    const preloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*>/g)].map((m) => m[0]);
    expect(preloads).toHaveLength(4);
    for (const link of preloads) {
      expect(link).toContain('as="font"');
      expect(link).toContain('type="font/woff2"');
      expect(link).toMatch(/crossorigin/);
    }
    expect(html).toMatch(/@font-face/);
    const faces = html.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    for (const link of preloads) {
      const href = /href="([^"]+)"/.exec(link)?.[1] ?? '';
      const face = faces.find((rule) => rule.includes(href));
      expect(face).toBeDefined();
      expect(face).toMatch(/font-style:\s*normal/);
    }
  });

  it('QA 012: metric-adjusted fallbacks stay within a plausible size-adjust (022: condensed 55–100 %)', async () => {
    const html = await render(BaseLayout, {
      title: 'Сезон',
      description:
        'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купите и как да ги приготвите.',
      path: '/',
    });
    const faces = [
      ...html.matchAll(/font-family:\s*(?:"|&quot;|')?([^"';&]+)[^}]*?size-adjust:\s*([\d.]+)%/g),
    ];
    expect(faces.length).toBeGreaterThan(0);
    for (const [, family = '', value] of faces) {
      const [min, max] = family.startsWith('Sofia Sans Extra Condensed') ? [55, 100] : [85, 115];
      expect(Number(value)).toBeGreaterThanOrEqual(min);
      expect(Number(value)).toBeLessThanOrEqual(max);
    }
  });
});

describe('BaseLayout fonts (spec 015)', () => {
  it('QA 015: italic faces never swap after first paint, upright faces swap', async () => {
    const html = await render(BaseLayout, {
      title: 'Сезон',
      description:
        'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купите и как да ги приготвите.',
      path: '/',
    });
    const faces = (html.match(/@font-face\s*\{[^}]*\}/g) ?? []).filter((rule) =>
      /url\(/.test(rule),
    );
    const italic = faces.filter((rule) => /font-style:\s*italic/.test(rule));
    const upright = faces.filter((rule) => /font-style:\s*normal/.test(rule));
    expect(italic.length).toBeGreaterThan(0);
    for (const rule of italic) expect(rule).toMatch(/font-display:\s*optional/);
    for (const rule of upright) expect(rule).toMatch(/font-display:\s*swap/);
  });
});
