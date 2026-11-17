import { describe, expect, it } from 'vitest';
import { FarmPagesQuery } from '@composition/FarmPagesQuery';
import { surroundingRegionSlug } from '@contexts/geography';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

const ON = new Date('2026-11-11T12:00:00+02:00');
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);
const farm = (slug: string, name: string, region: string) =>
  toFarm(slug, farmRecord({ name, region, produce: ['zele'] }));

const query = new FarmPagesQuery({
  regions: repositoryOf([
    toRegion('sofia-grad', { name: 'София-град' }),
    toRegion('sofiyska', { name: 'Софийска' }),
    toRegion('plovdiv', { name: 'Пловдив' }),
  ]),
  produce: repositoryOf([toProduce('zele', produceRecord({ name: 'Зеле' }))]),
  farms: new IndexedFarmRepository(async () => [
    farm('tikva', 'Тиква', 'sofia-grad'),
    farm('sofina', 'Софина', 'sofiyska'),
    farm('lesnovo', 'Лесново', 'sofiyska'),
    farm('yug', 'Юг', 'plovdiv'),
  ]),
});

describe('surrounding province (spec 062, QA)', () => {
  it('AC16: София-град is surrounded by Софийска област; other provinces have none', () => {
    expect(surroundingRegionSlug('sofia-grad')).toBe('sofiyska');
    expect(surroundingRegionSlug('plovdiv')).toBeUndefined();
  });

  it('AC16: the farm list group of София-град names Софийска област and its farm count', async () => {
    const groups = await query.byRegion(ON);
    const sofia = groups.find((group) => group.region.slug === 'sofia-grad');
    expect(sofia?.surrounding?.region.slug).toBe('sofiyska');
    expect(sofia?.surrounding?.farmCount).toBe(2);
    expect(groups.find((group) => group.region.slug === 'plovdiv')?.surrounding).toBeUndefined();
  });
});
