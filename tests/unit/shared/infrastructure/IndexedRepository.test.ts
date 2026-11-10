import { describe, expect, it } from 'vitest';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { DuplicateEntityError } from '@shared/domain/errors';
import { farmRecord } from '@tests/fixtures/records';

const items = [
  { slug: 'yabalki', name: 'Ябълки' },
  { slug: 'zele', name: 'Зеле' },
  { slug: 'dyuli', name: 'Дюли' },
  { slug: 'agrantsi', name: 'Агранти' },
];

describe('IndexedRepository', () => {
  it('AC8: returns all entities sorted by Bulgarian name', async () => {
    const repository = new IndexedRepository(async () => items);
    const names = (await repository.all()).map((item) => item.name);
    expect(names).toEqual(['Агранти', 'Дюли', 'Зеле', 'Ябълки']);
  });

  it('AC8: finds by slug and returns undefined for unknown slugs', async () => {
    const repository = new IndexedRepository(async () => items);
    expect((await repository.findBySlug('zele'))?.name).toBe('Зеле');
    expect(await repository.findBySlug('missing')).toBeUndefined();
  });

  it('AC8: loads the source once', async () => {
    let calls = 0;
    const repository = new IndexedRepository(async () => {
      calls += 1;
      return items;
    });
    await Promise.all([repository.all(), repository.findBySlug('zele'), repository.all()]);
    expect(calls).toBe(1);
  });

  it('AC8: rejects duplicate slugs', async () => {
    const repository = new IndexedRepository(async () => [
      ...items,
      { slug: 'zele', name: 'Друго' },
    ]);
    await expect(repository.all()).rejects.toThrow(DuplicateEntityError);
  });

  it('AC8: returns a frozen list', async () => {
    const repository = new IndexedRepository(async () => items);
    expect(Object.isFrozen(await repository.all())).toBe(true);
  });
});

describe('IndexedFarmRepository', () => {
  it('AC8: finds farms that sell a produce', async () => {
    const repository = new IndexedFarmRepository(async () => [
      toFarm('zelena-dolina', farmRecord()),
      toFarm('slanchev-sad', farmRecord({ name: 'Слънчев сад', produce: ['yabalki'] })),
    ]);
    const farms = await repository.findByProduce('yabalki');
    expect(farms.map((farm) => farm.slug)).toEqual(['slanchev-sad']);
    expect(await repository.findByProduce('tikva')).toEqual([]);
  });
});
