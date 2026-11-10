import { describe, expect, it } from 'vitest';
import MonthPager from '@components/season/MonthPager.astro';
import { Month } from '@contexts/seasonality';
import { render } from './render';

describe('MonthPager', () => {
  it('AC8: links to the previous and next months with descriptive names', async () => {
    const html = await render(MonthPager, { month: Month.of(11) });
    expect(html).toMatch(/<nav[^>]*aria-label="Други месеци"/);
    expect(html).toMatch(
      /<a[^>]*href="\/sezon\/oktomvri"[^>]*>[\s\S]*Предишен месец[\s\S]*Октомври[\s\S]*<\/a>/,
    );
    expect(html).toMatch(
      /<a[^>]*href="\/sezon\/dekemvri"[^>]*>[\s\S]*Следващ месец[\s\S]*Декември[\s\S]*<\/a>/,
    );
  });

  it('AC8: wraps around the year', async () => {
    const html = await render(MonthPager, { month: Month.of(1) });
    expect(html).toContain('href="/sezon/dekemvri"');
    expect(html).toContain('href="/sezon/fevruari"');
  });
});
