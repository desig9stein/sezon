import { describe, expect, it } from 'vitest';
import { SectionIndexService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const service = new SectionIndexService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'morkovi', name: 'Моркови', season: [{ month: 11, level: 'available' }] }),
    aProduce({ slug: 'tsveklo', name: 'Цвекло', season: [{ month: 11, level: 'storage' }] }),
    aProduce({ slug: 'spanak', name: 'Спанак', season: [{ month: 4, level: 'peak' }] }),
    aProduce({
      slug: 'yabalki',
      name: 'Ябълки',
      kind: 'fruit',
      season: [{ month: 11, level: 'peak' }],
    }),
  ]),
);
const slugs = (items: ReadonlyArray<{ slug: string }>) => items.map((item) => item.slug);

describe('SectionIndexService', () => {
  it('AC1: splits one kind by its level in the month, keeping repository order', async () => {
    const section = await service.sectionFor('vegetable', Month.of(11));

    expect(section.kind).toBe('vegetable');
    expect(section.month.number).toBe(11);
    expect(slugs(section.peak)).toEqual(['zele', 'praz']);
    expect(slugs(section.available)).toEqual(['morkovi']);
    expect(slugs(section.storage)).toEqual(['tsveklo']);
    expect(slugs(section.outOfSeason)).toEqual(['spanak']);
    expect(section.count).toBe(5);
    expect(Object.isFrozen(section)).toBe(true);
    expect(Object.isFrozen(section.peak)).toBe(true);
  });

  it('AC1: lists every produce of the kind exactly once', async () => {
    const section = await service.sectionFor('fruit', Month.of(4));

    expect(slugs(section.outOfSeason)).toEqual(['yabalki']);
    expect(section.peak).toEqual([]);
    expect(section.count).toBe(1);
  });

  it('AC2: returns empty lists for a kind without produce', async () => {
    const section = await service.sectionFor('nut', Month.of(11));

    expect([section.peak, section.available, section.storage, section.outOfSeason]).toEqual([
      [],
      [],
      [],
      [],
    ]);
    expect(section.count).toBe(0);
  });
});
