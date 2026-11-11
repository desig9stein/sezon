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
    expect(zeleRow).toMatch(/<span aria-hidden="true"[^>]*>\s*★\s*<\/span>/);
  });

  it('AC4: lists the four levels with their glyphs in the legend', async () => {
    const html = await render(SeasonCalendarTable, {
      calendar: await service.calendar(),
      currentMonth: Month.of(11),
    });
    const legend = html.slice(html.indexOf('calendar-legend'));
    for (const label of ['Разгар на сезона', 'В сезон', 'От хранилище', 'Извън сезона']) {
      expect(legend).toContain(label);
    }
  });
});
