import { describe, expect, it } from 'vitest';
import SeasonCalendarList from '@components/produce/SeasonCalendarList.astro';
import { Month } from '@contexts/seasonality';
import { aProduce } from '@tests/fixtures/produce';
import { render } from './render';

const produce = aProduce({
  slug: 'zele',
  name: 'Зеле',
  season: [
    { month: 10, level: 'peak' },
    { month: 11, level: 'available' },
    { month: 1, level: 'storage' },
  ],
});

describe('SeasonCalendarList', () => {
  it('AC6: renders 12 month links with level text', async () => {
    const html = await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) });
    expect(html.match(/<li\b/g)).toHaveLength(12);
    const text = html.replace(/<[^>]+>/g, '');
    expect(html).toContain('href="/sezon/oktomvri"');
    expect(text).toMatch(/Октомври[\s\S]*?Разгар на сезона/);
    expect(text).toMatch(/Януари[\s\S]*?От хранилище/);
    expect(html.match(/Извън сезона/g)).toHaveLength(9);
  });

  it('AC6: marks the current month', async () => {
    const html = await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) });
    expect(html.match(/aria-current="date"/g)).toHaveLength(1);
    expect(html).toMatch(
      /<a[^>]*href="\/sezon\/noemvri"[^>]*aria-current="date"|<a[^>]*aria-current="date"[^>]*href="\/sezon\/noemvri"/,
    );
  });

  it('AC7 (spec 013): shows the abbreviation with the rest of the month name visually hidden', async () => {
    const html = await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) });
    expect(html).toMatch(
      /Окт<span class="visually-hidden"[^>]*>омври<\/span>[\s\S]*?Разгар на сезона/,
    );
    expect(html).not.toMatch(/aria-label=/);
  });
});
