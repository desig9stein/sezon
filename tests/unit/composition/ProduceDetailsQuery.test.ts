import { describe, expect, it } from 'vitest';
import { ProduceDetailsQuery } from '@composition/ProduceDetailsQuery';
import { toNutrient, toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { BrokenReferenceError, ProduceNotFoundError } from '@shared/domain/errors';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

const nutrientRecord = (name: string, referenceIntake: number) => ({
  name,
  kind: 'vitamin' as const,
  unit: 'mg' as const,
  referenceIntake,
  description: 'Описание.',
});

function buildQuery(overrides: { groups?: boolean; nutrients?: boolean; regions?: boolean } = {}) {
  const zele = toProduce('zele', produceRecord());
  const groups =
    overrides.groups === false
      ? []
      : [
          toProduceGroup('krastotsvetni', {
            name: 'Кръстоцветни',
            latinName: 'Brassicaceae',
            description: 'Описание.',
          }),
        ];
  const nutrients =
    overrides.nutrients === false
      ? []
      : [
          toNutrient('vitamin-c', nutrientRecord('Витамин C', 80)),
          toNutrient('vitamin-k', nutrientRecord('Витамин K', 75)),
        ];
  const regions = overrides.regions === false ? [] : [toRegion('plovdiv', { name: 'Пловдив' })];
  const farms = [
    toFarm('zelena-dolina', farmRecord({ name: 'Зелена долина', produce: ['zele'] })),
    toFarm('agro', farmRecord({ name: 'Агро', produce: ['zele'] })),
    toFarm('sponsor', farmRecord({ name: 'Ябълкова градина', produce: ['zele'], sponsored: true })),
    toFarm('other', farmRecord({ name: 'Друга', produce: ['yabalki'] })),
  ];
  return new ProduceDetailsQuery({
    produce: repositoryOf([zele]),
    groups: repositoryOf(groups),
    nutrients: repositoryOf(nutrients),
    regions: repositoryOf(regions),
    farms: new IndexedFarmRepository(async () => farms),
  });
}

describe('ProduceDetailsQuery', () => {
  it('AC1: combines produce, group, nutrients, regions, farms and sources', async () => {
    const details = await buildQuery().forSlug('zele');
    expect(details.produce.slug).toBe('zele');
    expect(details.group.name).toBe('Кръстоцветни');
    expect(
      details.micronutrients.map((m) => [m.nutrient.slug, m.amount, m.percentOfReferenceIntake]),
    ).toEqual([
      ['vitamin-c', 36.6, 46],
      ['vitamin-k', 76, 101],
    ]);
    expect(details.growingRegions.map((r) => [r.region.name, r.note])).toEqual([
      ['Пловдив', 'Тракийската низина има плодородни почви.'],
    ]);
    expect(details.farms.map((farm) => farm.slug)).toEqual(['sponsor', 'agro', 'zelena-dolina']);
    expect(details.sources.map((source) => source.url)).toEqual([
      'https://fdc.nal.usda.gov/',
      'https://example.org/source',
    ]);
    expect(Object.isFrozen(details)).toBe(true);
  });

  it('AC1: lists every produce slug', async () => {
    expect(await buildQuery().allSlugs()).toEqual(['zele']);
  });

  it('AC2: throws ProduceNotFoundError for an unknown slug', async () => {
    await expect(buildQuery().forSlug('missing')).rejects.toThrow(ProduceNotFoundError);
  });

  it.each(['groups', 'nutrients', 'regions'] as const)(
    'AC2: throws BrokenReferenceError when %s are missing',
    async (missing) => {
      await expect(buildQuery({ [missing]: false }).forSlug('zele')).rejects.toThrow(
        BrokenReferenceError,
      );
    },
  );
});
