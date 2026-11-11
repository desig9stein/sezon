import { describe, expect, it } from 'vitest';
import { seasonGroups } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce } from '@tests/fixtures/produce';

const slugs = (items: ReadonlyArray<{ slug: string }>) => items.map((item) => item.slug);

describe('seasonGroups', () => {
  it('AC1: splits produce by level in the month and keeps all and count', () => {
    const items = [
      aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
      aProduce({ slug: 'morkovi', name: 'Моркови', season: [{ month: 11, level: 'available' }] }),
      aProduce({ slug: 'tsveklo', name: 'Цвекло', season: [{ month: 11, level: 'storage' }] }),
      aProduce({ slug: 'spanak', name: 'Спанак', season: [{ month: 4, level: 'peak' }] }),
    ];
    const groups = seasonGroups(items, Month.of(11));

    expect(groups.month.number).toBe(11);
    expect(slugs(groups.peak)).toEqual(['zele']);
    expect(slugs(groups.available)).toEqual(['morkovi']);
    expect(slugs(groups.storage)).toEqual(['tsveklo']);
    expect(slugs(groups.outOfSeason)).toEqual(['spanak']);
    expect(slugs(groups.all)).toEqual(['zele', 'morkovi', 'tsveklo', 'spanak']);
    expect(groups.count).toBe(4);
    expect(Object.isFrozen(groups)).toBe(true);
    expect(Object.isFrozen(groups.peak)).toBe(true);
  });
});
