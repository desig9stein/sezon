import { describe, expect, it } from 'vitest';
import SiteFooter from '@components/layout/SiteFooter.astro';
import { buildMonth } from '@composition/clock';
import { render } from './render';

describe('SiteFooter (spec 023)', () => {
  it('AC4: renders a labelled year strip with 12 months and marks the build month', async () => {
    const html = await render(SiteFooter);
    const nav = /<nav[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/nav>/.exec(html);
    expect(nav?.[1]).toBe('Месеците на годината');
    const links = [...(nav?.[2] ?? '').matchAll(/<a([^>]*)>/g)].map(([, attrs = '']) => attrs);
    expect(links).toHaveLength(12);
    const current = links.filter((attrs) => attrs.includes('aria-current="date"'));
    expect(current).toHaveLength(1);
    expect(current[0]).toContain(`href="/sezon/${buildMonth.slug}"`);
    expect(html.indexOf('href="/kalendar"')).toBeGreaterThan(html.indexOf('</nav>'));
    expect(html).toContain('не е медицински съвет');
  });
});
