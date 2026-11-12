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
    expect(html).toMatch(/<h2[^>]*>\s*Какво се сменя през ноември\s*<\/h2>/);
    const groups = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((match) => match[1]?.trim());
    expect(groups).toEqual([
      'Влиза в разгар',
      'Остава в разгар',
      'Излиза от разгар',
      'Минава към хранилище',
      'В градината',
    ]);
    expect(html).toMatch(/<a[^>]*href="\/zelenchutsi\/praz"[^>]*>Праз<\/a>/);
  });

  it('AC6: leaves out empty groups', async () => {
    const html = await render(MonthChanges, {
      changes: { ...changes, enteringPeak: [], toStorage: [] },
    });
    expect(html).not.toContain('Влиза в разгар');
    expect(html).not.toContain('Минава към хранилище');
    expect(html).toContain('Остава в разгар');
  });

  it('AC7: says the level now and the garden activities', async () => {
    const text = textOf(await render(MonthChanges, { changes }));
    expect(text).toContain('Тиква – сега: В сезон');
    expect(text).toContain('Чесън – Сеитба, Разсаждане');
  });

  it('AC7: says out of season for produce that left its peak and the season', async () => {
    const text = textOf(
      await render(MonthChanges, {
        changes: { ...changes, leavingPeak: [{ produce: tikva, levelNow: undefined }] },
      }),
    );
    expect(text).toContain('Тиква – сега: Извън сезона');
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
