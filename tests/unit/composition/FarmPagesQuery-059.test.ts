import { describe, expect, it } from 'vitest';
import { FarmPagesQuery } from '@composition/FarmPagesQuery';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

const ON = new Date('2026-11-11T12:00:00+02:00');
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

const regions = [
  toRegion('plovdiv', { name: 'Пловдив' }),
  toRegion('pleven', { name: 'Плевен' }),
  toRegion('varna', { name: 'Варна' }),
  toRegion('burgas', { name: 'Бургас' }),
];
const produce = [toProduce('zele', produceRecord({ name: 'Зеле' }))];
const farm = (slug: string, name: string, region: string) =>
  toFarm(slug, farmRecord({ name, region, produce: ['zele'] }));

const query = new FarmPagesQuery({
  regions: repositoryOf(regions),
  produce: repositoryOf(produce),
  farms: new IndexedFarmRepository(async () => [
    farm('yug', 'Юг', 'plovdiv'),
    farm('agro', 'Агро', 'plovdiv'),
    farm('venets', 'Венец', 'pleven'),
    farm('more', 'Море', 'varna'),
  ]),
});

describe('FarmPagesQuery.byRegion (spec 059)', () => {
  it('AC15: groups the farms by region in Bulgarian region order, farms by name, without empty regions', async () => {
    const groups = await query.byRegion(ON);
    expect(
      groups.map(({ region, farms }) => [region.slug, farms.map((entry) => entry.farm.slug)]),
    ).toEqual([
      ['varna', ['more']],
      ['pleven', ['venets']],
      ['plovdiv', ['agro', 'yug']],
    ]);
  });
});
