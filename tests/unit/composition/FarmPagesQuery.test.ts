import { describe, expect, it } from 'vitest';
import { FarmPagesQuery } from '@composition/FarmPagesQuery';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { BrokenReferenceError, FarmNotFoundError } from '@shared/domain/errors';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { certificateRecord } from '@tests/fixtures/organic';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

const ON = new Date('2026-11-11T12:00:00+02:00');
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

const regions = [toRegion('plovdiv', { name: 'Пловдив' }), toRegion('pleven', { name: 'Плевен' })];
const produce = [
  toProduce('zele', produceRecord({ name: 'Зеле' })),
  toProduce('praz', produceRecord({ name: 'Праз' })),
  toProduce('yabalki', produceRecord({ name: 'Ябълки' })),
];
const farms = [
  toFarm('venets', farmRecord({ name: 'Венец', region: 'pleven', produce: ['yabalki', 'praz'] })),
  toFarm(
    'agro',
    farmRecord({
      name: 'Агро',
      region: 'plovdiv',
      produce: ['zele'],
      organic: certificateRecord(),
    }),
  ),
];
const queryWith = (farmList = farms) =>
  new FarmPagesQuery({
    regions: repositoryOf(regions),
    produce: repositoryOf(produce),
    farms: new IndexedFarmRepository(async () => farmList),
  });

describe('FarmPagesQuery', () => {
  it('AC2: lists every farm in name order with its region and organic status', async () => {
    const all = await queryWith().all(ON);
    expect(
      all.map(({ farm, region, certifiedOrganic }) => [farm.slug, region.slug, certifiedOrganic]),
    ).toEqual([
      ['agro', 'plovdiv', true],
      ['venets', 'pleven', false],
    ]);
  });

  it('AC3: returns a farm with its region, organic status and produce in name order', async () => {
    const page = await queryWith().forSlug('venets', ON);
    expect(page.farm.name).toBe('Венец');
    expect(page.region.name).toBe('Плевен');
    expect(page.certifiedOrganic).toBe(false);
    expect(page.produce.map((item) => item.slug)).toEqual(['praz', 'yabalki']);
  });

  it('AC4: throws for an unknown farm and for an unknown produce', async () => {
    await expect(queryWith().forSlug('nyama', ON)).rejects.toThrow(FarmNotFoundError);
    const broken = [
      toFarm('lost', farmRecord({ name: 'Изгубена', region: 'pleven', produce: ['dini'] })),
    ];
    await expect(queryWith(broken).forSlug('lost', ON)).rejects.toThrow(BrokenReferenceError);
  });
});
