import { describe, expect, it } from 'vitest';
import { MonthChangesService } from '@contexts/catalog';
import { Month, SeasonLevel } from '@contexts/seasonality';
import { growingRecord } from '@tests/fixtures/growing';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const zele = aProduce({
  slug: 'zele',
  name: 'Зеле',
  season: [
    { month: 10, level: 'peak' },
    { month: 11, level: 'peak' },
  ],
});
const praz = aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'peak' }] });
const tikva = aProduce({
  slug: 'tikva',
  name: 'Тиква',
  season: [
    { month: 10, level: 'peak' },
    { month: 11, level: 'available' },
  ],
});
const domati = aProduce({ slug: 'domati', name: 'Домати', season: [{ month: 10, level: 'peak' }] });
const krushi = aProduce({
  slug: 'krushi',
  name: 'Круши',
  kind: 'fruit',
  season: [
    { month: 10, level: 'available' },
    { month: 11, level: 'storage' },
  ],
});
const yabalki = aProduce({
  slug: 'yabalki',
  name: 'Ябълки',
  kind: 'fruit',
  season: [
    { month: 10, level: 'storage' },
    { month: 11, level: 'storage' },
  ],
});
const chesan = aProduce({
  slug: 'chesan',
  name: 'Чесън',
  season: [{ month: 6, level: 'peak' }],
  growing: growingRecord({ sow: [11], transplant: [11], plant: [] }),
});
const spanak = aProduce({
  slug: 'spanak',
  name: 'Спанак',
  season: [{ month: 4, level: 'peak' }],
  growing: growingRecord({ sow: [3], transplant: [], plant: [] }),
});

const service = new MonthChangesService(
  produceRepositoryOf([zele, praz, tikva, domati, krushi, yabalki, chesan, spanak]),
);
const slugs = (items: ReadonlyArray<{ slug: string }>) => items.map((item) => item.slug);

describe('MonthChangesService', () => {
  it('AC1: splits produce into entering, staying and leaving peak and moving to storage', async () => {
    const changes = await service.changesFor(Month.of(11));
    expect(changes.month).toBe(Month.of(11));
    expect(changes.previous).toBe(Month.of(10));
    expect(slugs(changes.stayingPeak)).toEqual(['zele']);
    expect(slugs(changes.enteringPeak)).toEqual(['praz']);
    expect(slugs(changes.leavingPeak.map((entry) => entry.produce))).toEqual(['domati', 'tikva']);
    expect(slugs(changes.toStorage)).toEqual(['krushi']);
    expect(changes.isEmpty).toBe(false);
  });

  it('AC2: says the level now of produce leaving its peak', async () => {
    const { leavingPeak } = await service.changesFor(Month.of(11));
    const levelOf = (slug: string) =>
      leavingPeak.find((entry) => entry.produce.slug === slug)?.levelNow;
    expect(levelOf('tikva')).toBe(SeasonLevel.AVAILABLE);
    expect(levelOf('domati')).toBeUndefined();
  });

  it('AC3: lists the garden jobs of the month with their activities', async () => {
    const { garden } = await service.changesFor(Month.of(11));
    expect(garden.map((entry) => entry.produce.slug)).toEqual(['chesan']);
    expect(garden[0]?.activities).toEqual(['sow', 'transplant']);
  });

  it('AC4: compares January with December', async () => {
    const winter = aProduce({
      slug: 'praz',
      name: 'Праз',
      season: [
        { month: 12, level: 'peak' },
        { month: 1, level: 'peak' },
      ],
    });
    const changes = await new MonthChangesService(produceRepositoryOf([winter])).changesFor(
      Month.of(1),
    );
    expect(changes.previous).toBe(Month.of(12));
    expect(slugs(changes.stayingPeak)).toEqual(['praz']);
  });

  it('AC5: is empty when nothing changes', async () => {
    const changes = await service.changesFor(Month.of(8));
    expect(changes.isEmpty).toBe(true);
  });
});
