import { describe, expect, it } from 'vitest';
import SeasonList from '@components/season/SeasonList.astro';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const at = (level: 'peak' | 'available' | 'storage') => [{ month: 11, level }];
const overview = await new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'kruhi', name: 'Круши', kind: 'fruit', season: at('storage') }),
    aProduce({ slug: 'yabalki', name: 'Ябълки', kind: 'fruit', season: at('available') }),
    aProduce({ slug: 'zele', name: 'Зеле', season: at('peak') }),
    aProduce({ slug: 'praz', name: 'Праз', season: at('peak') }),
  ]),
).overviewFor(Month.of(11));

describe('SeasonList (spec 024)', () => {
  it('AC3: lists peak, then available, then storage under one counted heading', async () => {
    const html = await render(SeasonList, { overview });
    expect(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')).toContain('В сезон през ноември (4)');
    const rows = [...html.matchAll(/<li[\s\S]*?<\/li>/g)].map((match) => match[0]);
    expect(rows.map((row) => /season-stamp" data-level="(\w+)"/.exec(row)?.[1])).toEqual([
      'peak',
      'peak',
      'available',
      'storage',
    ]);
    for (const row of rows) {
      expect(row).toMatch(/season-stamp/);
      expect(row).toMatch(/year-strip/);
    }
  });
});
