import { describe, expect, it } from 'vitest';
import { RegionPagesQuery } from '@composition/RegionPagesQuery';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { produceRecord, regionProfileRecord } from '@tests/fixtures/records';

const ON = new Date('2026-11-13T12:00:00+02:00');
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

const regions = [
  toRegion('plovdiv', { name: 'Пловдив', profile: regionProfileRecord() }),
  toRegion('smolyan', {
    name: 'Смолян',
    profile: regionProfileRecord({
      utilisedAreaHa: 34777,
      arableHa: 1277,
      grasslandHa: 32125,
      topFruits: [
        { name: 'сливите', areaHa: 47 },
        { name: 'орехите', areaHa: 28 },
      ],
    }),
  }),
  toRegion('burgas', { name: 'Бургас' }),
];
const query = new RegionPagesQuery({
  regions: repositoryOf(regions),
  produce: repositoryOf([toProduce('zele', produceRecord())]),
  farms: new IndexedFarmRepository(async () => []),
});

describe('RegionPagesQuery with province profiles (spec 038)', () => {
  it('AC8: a region with a profile has a page even with no produce and no farm', async () => {
    const overview = await query.overview();
    expect(
      overview.map(({ region, produceCount, farmCount, hasPage }) => [
        region.slug,
        produceCount,
        farmCount,
        hasPage,
      ]),
    ).toEqual([
      ['burgas', 0, 0, false],
      ['plovdiv', 1, 0, true],
      ['smolyan', 0, 0, true],
    ]);
    expect(await query.pageSlugs()).toEqual(['plovdiv', 'smolyan']);
  });

  it('AC8: forSlug returns the rank of the utilised area', async () => {
    expect((await query.forSlug('plovdiv', ON)).areaRank).toEqual({ rank: 1, total: 2 });
    const smolyan = await query.forSlug('smolyan', ON);
    expect(smolyan.areaRank).toEqual({ rank: 2, total: 2 });
    expect(smolyan.region.profile?.utilisedAreaHa).toBe(34777);
    expect((await query.forSlug('burgas', ON)).areaRank).toBeUndefined();
  });
});
