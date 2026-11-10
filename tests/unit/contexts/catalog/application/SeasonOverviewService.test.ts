import { describe, expect, it } from 'vitest';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const produce = [
  aProduce({
    slug: 'zele',
    name: 'Зеле',
    season: [
      { month: 11, level: 'peak' },
      { month: 12, level: 'available' },
    ],
  }),
  aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'peak' }] }),
  aProduce({
    slug: 'yabalki',
    name: 'Ябълки',
    kind: 'fruit',
    season: [{ month: 11, level: 'available' }],
  }),
  aProduce({
    slug: 'dyuli',
    name: 'Дюли',
    kind: 'fruit',
    season: [{ month: 11, level: 'available' }],
  }),
  aProduce({
    slug: 'krushi',
    name: 'Круши',
    kind: 'fruit',
    season: [
      { month: 11, level: 'storage' },
      { month: 12, level: 'storage' },
    ],
  }),
  aProduce({ slug: 'spanak', name: 'Спанак', season: [{ month: 12, level: 'available' }] }),
  aProduce({
    slug: 'kopar',
    name: 'Копър',
    kind: 'herb',
    season: [{ month: 12, level: 'storage' }],
  }),
  aProduce({ slug: 'yagodi', name: 'Ягоди', kind: 'fruit', season: [{ month: 1, level: 'peak' }] }),
  aProduce({ slug: 'chesan', name: 'Чесън', season: [{ month: 5, level: 'peak' }] }),
];

const service = new SeasonOverviewService(produceRepositoryOf(produce));
const slugs = (items: ReadonlyArray<{ slug: string }>) => items.map((item) => item.slug);

describe('SeasonOverviewService', () => {
  it('AC1: groups produce by level in the month, sorted by Bulgarian name', async () => {
    const overview = await service.overviewFor(Month.of(11));
    expect(overview.month).toBe(Month.of(11));
    expect(slugs(overview.peak)).toEqual(['zele', 'praz']);
    expect(slugs(overview.available)).toEqual(['dyuli', 'yabalki']);
    expect(slugs(overview.storage)).toEqual(['krushi']);
    expect(slugs(overview.comingSoon)).toEqual(['spanak']);
    expect(overview.freshCount).toBe(4);
  });

  it('AC1: puts each produce in at most one group and freezes the lists', async () => {
    const overview = await service.overviewFor(Month.of(11));
    const all = [
      ...overview.peak,
      ...overview.available,
      ...overview.storage,
      ...overview.comingSoon,
    ];
    expect(new Set(slugs(all)).size).toBe(all.length);
    expect(Object.isFrozen(overview)).toBe(true);
    expect(Object.isFrozen(overview.peak)).toBe(true);
  });

  it('AC2: computes coming soon for December from January', async () => {
    const overview = await service.overviewFor(Month.of(12));
    expect(slugs(overview.comingSoon)).toEqual(['yagodi']);
  });

  it('AC3: does not treat storage-only next month as coming soon', async () => {
    const overview = await service.overviewFor(Month.of(11));
    expect(slugs(overview.comingSoon)).not.toContain('kopar');
  });

  it('returns empty groups for a month without produce', async () => {
    const overview = await service.overviewFor(Month.of(8));
    expect(overview.freshCount).toBe(0);
    expect(overview.peak).toEqual([]);
    expect(overview.comingSoon).toEqual([]);
  });
});
