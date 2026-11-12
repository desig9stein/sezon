import { describe, expect, it } from 'vitest';
import MonthChanges from '@components/season/MonthChanges.astro';
import type { MonthChanges as Changes } from '@contexts/catalog';
import { Month, SeasonLevel } from '@contexts/seasonality';
import { aProduce } from '@tests/fixtures/produce';
import { render } from './render';

const produceNamed = (slug: string, name: string) =>
  aProduce({ slug, name, season: [{ month: 11, level: 'peak' }] });
const praz = produceNamed('praz', 'Праз');
const zele = produceNamed('zele', 'Зеле');
const tikva = produceNamed('tikva', 'Тиква');
const krushi = produceNamed('krushi', 'Круши');
const chesan = produceNamed('chesan', 'Чесън');

const changes: Changes = {
  month: Month.of(11),
  previous: Month.of(10),
  enteringPeak: [praz],
  stayingPeak: [zele],
  leavingPeak: [{ produce: tikva, levelNow: SeasonLevel.AVAILABLE }],
  toStorage: [krushi],
  garden: [{ produce: chesan, activities: ['sow', 'transplant'] }],
  isEmpty: false,
};
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('MonthChanges', () => {
  it('AC6: renders the heading, the groups in order and produce links', async () => {
    const html = await render(MonthChanges, { changes });
    expect(html).toMatch(/<h2[^>]*>\s*Какво се променя през ноември\s*<\/h2>/);
    const groups = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((match) => match[1]?.trim());
    expect(groups).toEqual([
      'Навлизат в разгара си',
      'Още са в разгара си',
      'Отминава им разгарът, още са в сезон',
      'Вече от хранилище',
      'В градината',
    ]);
    expect(html).toMatch(/<a[^>]*href="\/zelenchutsi\/praz"[^>]*>Праз<\/a>/);
  });

  it('AC6: leaves out empty groups', async () => {
    const html = await render(MonthChanges, {
      changes: { ...changes, enteringPeak: [], toStorage: [] },
    });
    expect(html).not.toContain('Навлизат в разгара си');
    expect(html).not.toContain('Вече от хранилище');
    expect(html).toContain('Още са в разгара си');
  });

  it('AC7: lists the garden activities after the name', async () => {
    const text = textOf(await render(MonthChanges, { changes }));
    expect(text).toContain('Чесън – Сеитба, Разсаждане');
    expect(text).not.toContain('сега:');
  });

  it('AC7: groups produce leaving its peak by its level now', async () => {
    const html = await render(MonthChanges, {
      changes: {
        ...changes,
        leavingPeak: [
          { produce: tikva, levelNow: undefined },
          { produce: zele, levelNow: SeasonLevel.STORAGE },
          { produce: praz, levelNow: SeasonLevel.AVAILABLE },
        ],
      },
    });
    const groups = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((match) => match[1]?.trim());
    expect(groups).toEqual(
      expect.arrayContaining([
        'Отминава им разгарът, още са в сезон',
        'Отминава им разгарът, вече от хранилище',
        'Отминава им разгарът, вече извън сезона',
      ]),
    );
    expect(groups.indexOf('Отминава им разгарът, още са в сезон')).toBeLessThan(
      groups.indexOf('Отминава им разгарът, вече извън сезона'),
    );
  });

  it('AC8: renders nothing when nothing changes', async () => {
    const html = await render(MonthChanges, {
      changes: {
        ...changes,
        enteringPeak: [],
        stayingPeak: [],
        leavingPeak: [],
        toStorage: [],
        garden: [],
        isEmpty: true,
      },
    });
    expect(html.trim()).toBe('');
  });
});
