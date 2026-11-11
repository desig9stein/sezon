import { describe, expect, it } from 'vitest';
import YearStrip from '@components/season/YearStrip.astro';
import { Month } from '@contexts/seasonality';
import { aProduce } from '@tests/fixtures/produce';
import { render } from './render';

const produce = aProduce({
  slug: 'kruhi',
  name: 'Круши',
  season: [
    { month: 8, level: 'available' },
    { month: 9, level: 'peak' },
    { month: 10, level: 'peak' },
    { month: 12, level: 'storage' },
    { month: 1, level: 'storage' },
    { month: 2, level: 'storage' },
    { month: 3, level: 'storage' },
  ],
});

describe('YearStrip (spec 024)', () => {
  it('AC1: draws 12 cells with each month level and marks the current month', async () => {
    const html = await render(YearStrip, { produce, current: Month.of(11) });
    const levels = [...html.matchAll(/data-month="(\d+)"[^>]*data-level="(\w+)"/g)].map(
      ([, month, level]) => [Number(month), level],
    );
    expect(levels).toEqual([
      [1, 'storage'],
      [2, 'storage'],
      [3, 'storage'],
      [4, 'none'],
      [5, 'none'],
      [6, 'none'],
      [7, 'none'],
      [8, 'available'],
      [9, 'peak'],
      [10, 'peak'],
      [11, 'none'],
      [12, 'storage'],
    ]);
    expect(html.match(/year-strip__current/g)).toHaveLength(1);
    expect(html).toMatch(/data-month="11"[^>]*>(?:(?!data-month)[\s\S])*year-strip__current/);
  });

  it('AC1: has a text alternative listing the months of each level', async () => {
    const html = await render(YearStrip, { produce, current: Month.of(11) });
    expect(html).toMatch(/<svg[^>]*role="img"/);
    expect(html).toContain(
      '<title>Разгар: септември – октомври; В сезон: август; От хранилище: декември – март</title>',
    );
    expect(html).toContain(
      'aria-label="Разгар: септември – октомври; В сезон: август; От хранилище: декември – март"',
    );
  });
});
