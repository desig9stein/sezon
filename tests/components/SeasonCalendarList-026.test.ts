import { describe, expect, it } from 'vitest';
import SeasonCalendarList from '@components/produce/SeasonCalendarList.astro';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { growingRecord } from '@tests/fixtures/growing';
import { produceRecord } from '@tests/fixtures/records';
import { render } from './render';

const season = [{ month: 10, level: 'peak' as const }];
const withGrowing = (growing: ReturnType<typeof growingRecord> | undefined) =>
  toProduce('zele', { ...produceRecord({ season }), growing });
const gardenList = (html: string) => {
  const match = /<ul[^>]*aria-labelledby="([^"]+)"[^>]*>([\s\S]*?)<\/ul>/.exec(html);
  return {
    id: match?.[1],
    items: [...(match?.[2] ?? '').matchAll(/<li\b[\s\S]*?<\/li>/g)].map((item) =>
      item[0]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    ),
  };
};

describe('SeasonCalendarList garden row (spec 026)', () => {
  it('AC5: renders a labelled list of 12 months with the activities', async () => {
    const produce = withGrowing(growingRecord({ sow: [3, 4], transplant: [5], plant: [] }));
    const html = await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) });
    const { id, items } = gardenList(html);
    expect(html).toMatch(new RegExp(`id="${id}"[^>]*>\\s*В градината`));
    expect(items).toHaveLength(12);
    expect(items[2]).toBe('Март Сеитба');
    expect(items[3]).toBe('Април Сеитба');
    expect(items[4]).toBe('Май Разсаждане');
    expect(items.filter((item) => item.endsWith('– нищо'))).toHaveLength(9);
    expect(html).toMatch(
      /<span aria-hidden="true"[^>]*>–<\/span>\s*<span class="visually-hidden"[^>]*>нищо<\/span>/,
    );
  });

  it('AC6: joins two activities in one month', async () => {
    const produce = withGrowing(growingRecord({ sow: [3], transplant: [3], plant: [] }));
    const { items } = gardenList(
      await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) }),
    );
    expect(items[2]).toBe('Март Сеитба, Разсаждане');
  });

  it('AC7: omits the garden row without a growing guide', async () => {
    const produce = withGrowing(undefined);
    const html = await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) });
    expect(html).not.toContain('В градината');
    expect(html.match(/<ul\b/g)).toHaveLength(1);
  });
});

describe('SeasonCalendarList garden row QA (spec 026)', () => {
  it('AC12: omits the garden row when the guide has no month', async () => {
    const produce = withGrowing(growingRecord({ sow: [], transplant: [], plant: [] }));
    const html = await render(SeasonCalendarList, { produce, currentMonth: Month.of(11) });
    expect(html).not.toContain('В градината');
  });
});
