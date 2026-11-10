import { describe, expect, it } from 'vitest';
import BaseLayout from '@layouts/BaseLayout.astro';
import { jsonLdBlocks, render } from './render';

const DESCRIPTION =
  'Вижте кои плодове и зеленчуци са в сезон в България този месец и откъде да ги купите.';

async function renderLayout(props: Record<string, unknown> = {}) {
  return render(
    BaseLayout,
    { title: 'Ноември', description: DESCRIPTION, path: '/sezon/noemvri', ...props },
    { default: '<h1>Съдържание</h1>' },
  );
}

describe('BaseLayout', () => {
  it('AC8: renders the document language and the skip link as the first link', async () => {
    const html = await renderLayout();
    expect(html).toMatch(/<html[^>]*lang="bg"/);
    const firstLink = html.match(/<a\b[^>]*>/)?.[0] ?? '';
    expect(firstLink).toContain('href="#main"');
    expect(html).toContain('Към основното съдържание');
  });

  it('AC8: renders landmarks with Bulgarian labels and the main target', async () => {
    const html = await renderLayout();
    expect(html).toMatch(/<header\b/);
    expect(html).toMatch(/<nav[^>]*aria-label="Основна навигация"/);
    expect(html).toMatch(/<main[^>]*id="main"/);
    expect(html).toMatch(/<footer\b/);
    expect(html).toContain('<h1>Съдържание</h1>');
  });

  it('AC8: renders every SEO tag', async () => {
    const html = await renderLayout();
    expect(html).toContain('<title>Ноември | Сезон</title>');
    expect(html).toMatch(/<meta name="description" content="Вижте кои плодове/);
    expect(html).toContain('<link rel="canonical" href="https://sezon.example/sezon/noemvri">');
    expect(html).toContain('<meta property="og:title" content="Ноември | Сезон">');
    expect(html).toMatch(/<meta property="og:description" content="Вижте/);
    expect(html).toContain(
      '<meta property="og:url" content="https://sezon.example/sezon/noemvri">',
    );
    expect(html).toContain('<meta property="og:type" content="website">');
    expect(html).toContain('<meta property="og:locale" content="bg_BG">');
    expect(html).toContain('<meta property="og:site_name" content="Сезон">');
    expect(html).toContain('<meta name="twitter:card" content="summary">');
    expect(html).toContain('<meta name="robots" content="index, follow">');
    expect(html).toMatch(/<meta name="theme-color"[^>]*media="\(prefers-color-scheme: light\)"/);
    expect(html).toMatch(/<meta name="theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/);
  });

  it('AC8: inlines the design tokens', async () => {
    const html = await renderLayout();
    expect(html).toContain('--color-background:');
  });

  it('AC8: renders extra JSON-LD as valid JSON', async () => {
    const html = await renderLayout({ jsonLd: [{ '@type': 'Thing', name: '</script>' }] });
    expect(jsonLdBlocks(html)).toContainEqual({ '@type': 'Thing', name: '</script>' });
  });

  it('AC8: marks the current navigation link', async () => {
    const html = await renderLayout({ path: '/', title: 'Сезон' });
    expect(html).toMatch(
      /<a[^>]*href="\/"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/"/,
    );
  });

  it('AC8: ships no client-side script other than JSON-LD', async () => {
    const html = await renderLayout();
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((match) => match[1]);
    expect(scripts.every((attributes) => attributes?.includes('application/ld+json'))).toBe(true);
  });
});
