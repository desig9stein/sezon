import { describe, expect, it } from 'vitest';
import YearRibbon from '@components/season/YearRibbon.astro';
import { Month } from '@contexts/seasonality';
import { render } from './render';

describe('YearRibbon', () => {
  it('AC2: links all 12 months, showing abbreviations inside full names, and marks the current month', async () => {
    const html = await render(YearRibbon, { current: Month.of(11) });

    expect(html).toMatch(/<nav[^>]*aria-label="Месеци"/);
    expect(html).toMatch(/<ol\b/);
    const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    expect(links).toHaveLength(12);
    expect(links[0]?.[1]).toContain('href="/sezon/yanuari"');
    const text = (inner: string | undefined) => (inner ?? '').replace(/<[^>]+>/g, '').trim();
    expect(text(links[0]?.[2])).toBe('Януари');
    expect(links[0]?.[2]).toMatch(/Яну<span class="visually-hidden"[^>]*>ари<\/span>/);
    expect(text(links[4]?.[2])).toBe('Май');
    expect(links[4]?.[2]).not.toContain('visually-hidden');
    expect(html.match(/aria-current="date"/g)).toHaveLength(1);
    expect(links[10]?.[1]).toContain('aria-current="date"');
  });
});
