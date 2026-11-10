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
    expect(details.farms.map(({ farm }) => farm.slug)).toEqual([
      'sponsor',
      'agro',
      'zelena-dolina',
    ]);
    expect(details.farms.map(({ region }) => region.name)).toEqual([
      'Пловдив',
      'Пловдив',
      'Пловдив',
    ]);
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

  it('QA 005: resolves the region of a farm outside the growing regions', async () => {
    const zele = toProduce('zele', produceRecord());
    const query = new ProduceDetailsQuery({
      produce: repositoryOf([zele]),
      groups: repositoryOf([
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([
        toNutrient('vitamin-c', nutrientRecord('Витамин C', 80)),
        toNutrient('vitamin-k', nutrientRecord('Витамин K', 75)),
      ]),
      regions: repositoryOf([
        toRegion('plovdiv', { name: 'Пловдив' }),
        toRegion('veliko-tarnovo', { name: 'Велико Търново' }),
      ]),
      farms: new IndexedFarmRepository(async () => [
        toFarm('gora', farmRecord({ name: 'Гора', region: 'veliko-tarnovo', produce: ['zele'] })),
      ]),
    });
    const details = await query.forSlug('zele');
    expect(details.farms.map(({ region }) => region.name)).toEqual(['Велико Търново']);
  });

  it('QA 005: throws BrokenReferenceError when a farm region is missing', async () => {
    const zele = toProduce('zele', produceRecord());
    const query = new ProduceDetailsQuery({
      produce: repositoryOf([zele]),
      groups: repositoryOf([
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([
        toNutrient('vitamin-c', nutrientRecord('Витамин C', 80)),
        toNutrient('vitamin-k', nutrientRecord('Витамин K', 75)),
      ]),
      regions: repositoryOf([toRegion('plovdiv', { name: 'Пловдив' })]),
      farms: new IndexedFarmRepository(async () => [
        toFarm('gora', farmRecord({ name: 'Гора', region: 'missing', produce: ['zele'] })),
      ]),
    });
    await expect(query.forSlug('zele')).rejects.toThrow(BrokenReferenceError);
  });

  it('QA 005: de-duplicates sources by URL and name', async () => {
    const record = produceRecord();
    const duplicate = { ...record.traditionalUses[0]!, source: record.nutrition.source };
    const sameUrlOtherName = {
      ...record.traditionalUses[0]!,
      source: { name: 'Друго име', url: record.nutrition.source.url },
    };
    const zele = toProduce('zele', {
      ...record,
      traditionalUses: [...record.traditionalUses, duplicate, sameUrlOtherName],
    });
    const query = new ProduceDetailsQuery({
      produce: repositoryOf([zele]),
      groups: repositoryOf([
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([
        toNutrient('vitamin-c', nutrientRecord('Витамин C', 80)),
        toNutrient('vitamin-k', nutrientRecord('Витамин K', 75)),
      ]),
      regions: repositoryOf([toRegion('plovdiv', { name: 'Пловдив' })]),
      farms: new IndexedFarmRepository(async () => []),
    });
    const { sources } = await query.forSlug('zele');
    expect(sources.map((source) => source.name)).toEqual([
      record.nutrition.source.name,
      'Народна медицина',
      'Друго име',
    ]);
  });
});
