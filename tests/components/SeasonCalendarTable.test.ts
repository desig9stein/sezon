import { describe, expect, it } from 'vitest';
import SeasonCalendarTable from '@components/season/SeasonCalendarTable.astro';
import { SeasonCalendarService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SeasonCalendarService(
  produceRepositoryOf([
    aProduce({
      slug: 'zele',
      name: 'Зеле',
      season: [
        { month: 10, level: 'peak' },
        { month: 11, level: 'available' },
        { month: 1, level: 'storage' },
      ],
    }),
    aProduce({
      slug: 'yabalki',
      name: 'Ябълки',
      kind: 'fruit',
      season: [{ month: 9, level: 'peak' }],
    }),
  ]),
);

describe('SeasonCalendarTable', () => {
  it('AC3: renders caption, month headers, grouped bodies, produce rows and level cells', async () => {
    const html = await render(SeasonCalendarTable, {
      calendar: await service.calendar(),
      currentMonth: Month.of(11),
    });

    expect(html).toMatch(/<caption[^>]*>[^<]+<\/caption>/);
    expect(html.match(/<th[^>]*scope="col"/g)).toHaveLength(13);
    expect(html.match(/aria-current="date"/g)).toHaveLength(1);
    expect(html).toMatch(/<th[^>]*aria-current="date"[^>]*>[\s\S]*?Ное</);
    expect(html.match(/<tbody/g)).toHaveLength(2);
    expect(html).toMatch(
      /<th[^>]*scope="rowgroup"[^>]*colspan="13"[^>]*>\s*<a href="\/plodove"[^>]*>Плодове<\/a>/,
    );
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>\s*<a href="\/zelenchutsi\/zele"[^>]*>Зеле<\/a>/,
    );
    const zeleRow = html.slice(
      html.indexOf('/zelenchutsi/zele'),
      html.indexOf('</tr>', html.indexOf('/zelenchutsi/zele')),
    );
    expect(zeleRow.match(/<td/g)).toHaveLength(12);
    expect(zeleRow).toContain('Разгар на сезона');
    expect(zeleRow).toContain('От хранилище');
    expect(zeleRow).toContain('Извън сезона');
    expect(zeleRow).toMatch(/<svg[^>]*data-mark="peak"/);
  });

  it('AC4: lists the four levels with their marks in the legend', async () => {
    const html = await render(SeasonCalendarTable, {
      calendar: await service.calendar(),
      currentMonth: Month.of(11),
    });
    const start = html.indexOf('<ul class="calendar-legend"');
    const legend = html.slice(start, html.indexOf('</ul>', start));
    expect(legend.match(/<li/g)).toHaveLength(4);
    for (const [mark, label] of [
      ['peak', 'Разгар на сезона'],
      ['available', 'В сезон'],
      ['storage', 'От хранилище'],
      ['none', 'Извън сезона'],
    ]) {
      expect(legend).toMatch(
        new RegExp(`<svg[^>]*data-mark="${mark}"[\\s\\S]*?</svg>\\s*${label}`),
      );
    }
  });

  it('QA 014: draws every level mark as a decorative SVG of the same size', async () => {
    const html = await render(SeasonCalendarTable, {
      calendar: await service.calendar(),
      currentMonth: Month.of(11),
    });
    const marks = html.match(/<svg[^>]*>/g) ?? [];
    expect(marks.length).toBeGreaterThan(0);
    for (const mark of marks) {
      expect(mark).toContain('aria-hidden="true"');
      expect(mark).toMatch(/width="14"/);
      expect(mark).toMatch(/height="14"/);
    }
  });

  it('QA 014: shows the empty message instead of the table when the catalogue is empty', async () => {
    const html = await render(SeasonCalendarTable, {
      calendar: { groups: [] },
      currentMonth: Month.of(11),
    });
    expect(html).toContain('Няма данни за календара.');
    expect(html).not.toContain('<table');
  });
});
