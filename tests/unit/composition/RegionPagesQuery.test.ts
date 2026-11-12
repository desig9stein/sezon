import { describe, expect, it } from 'vitest';
import { RegionPagesQuery } from '@composition/RegionPagesQuery';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { RegionNotFoundError } from '@shared/domain/errors';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { certificateRecord } from '@tests/fixtures/organic';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

const ON = new Date('2026-11-11T12:00:00+02:00');
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

const regions = [
  toRegion('plovdiv', { name: 'Пловдив' }),
  toRegion('pleven', { name: 'Плевен' }),
  toRegion('burgas', { name: 'Бургас' }),
];
const zele = toProduce(
  'zele',
  produceRecord({ name: 'Зеле', regions: [{ region: 'plovdiv', note: 'Тракийската низина.' }] }),
);
const praz = toProduce(
  'praz',
  produceRecord({
    name: 'Праз',
    regions: [
      { region: 'plovdiv', note: 'Поливни площи.' },
      { region: 'pleven', note: 'Дунавската равнина.' },
    ],
  }),
);
const farms = [
  toFarm('agro', farmRecord({ name: 'Агро', region: 'plovdiv', produce: ['zele'] })),
  toFarm(
    'bio',
    farmRecord({
      name: 'Био',
      region: 'plovdiv',
      produce: ['praz'],
      sponsored: true,
      organic: certificateRecord(),
    }),
  ),
  toFarm('dunav', farmRecord({ name: 'Дунав', region: 'pleven', produce: ['praz'] })),
  toFarm(
    'staro-bio',
    farmRecord({
      name: 'Старо био',
      region: 'pleven',
      produce: ['praz'],
      organic: certificateRecord({ validUntil: new Date('2025-12-31') }),
    }),
  ),
];
const query = new RegionPagesQuery({
  regions: repositoryOf(regions),
  produce: repositoryOf([zele, praz]),
  farms: new IndexedFarmRepository(async () => farms),
});

describe('RegionPagesQuery', () => {
  it('AC1: lists every region in name order with counts and whether it has a page', async () => {
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
      ['pleven', 1, 2, true],
      ['plovdiv', 2, 2, true],
    ]);
    expect(await query.pageSlugs()).toEqual(['pleven', 'plovdiv']);
  });

  it('AC2: returns the region with its produce and notes and its farms, sponsored first', async () => {
    const page = await query.forSlug('plovdiv', ON);
    expect(page.region.name).toBe('Пловдив');
    expect(page.produce.map(({ produce, note }) => [produce.slug, note])).toEqual([
      ['zele', 'Тракийската низина.'],
      ['praz', 'Поливни площи.'],
    ]);
    expect(page.farms.map(({ farm, certifiedOrganic }) => [farm.slug, certifiedOrganic])).toEqual([
      ['bio', true],
      ['agro', false],
    ]);
    expect(page.farms[0]?.region.slug).toBe('plovdiv');
  });

  it('AC3: throws RegionNotFoundError for an unknown slug', async () => {
    await expect(query.forSlug('atlantida', ON)).rejects.toThrow(RegionNotFoundError);
  });
});

describe('RegionPagesQuery QA (spec 029)', () => {
  it('AC2: does not count a lapsed certificate as organic', async () => {
    const page = await query.forSlug('pleven', ON);
    expect(page.farms.map(({ farm, certifiedOrganic }) => [farm.slug, certifiedOrganic])).toEqual([
      ['dunav', false],
      ['staro-bio', false],
    ]);
  });
});
