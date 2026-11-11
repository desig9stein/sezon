import { describe, expect, it } from 'vitest';
import { ProduceDetailsQuery } from '@composition/ProduceDetailsQuery';
import { toNutrient, toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { certificateRecord, organicRecord } from '@tests/fixtures/organic';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { farmRecord, NUTRIENT_CLAIMS, produceRecord } from '@tests/fixtures/records';

const nutrient = (name: string) => ({
  name,
  kind: 'vitamin' as const,
  unit: 'mg' as const,
  referenceIntake: 80,
  ...NUTRIENT_CLAIMS,
});

describe('ProduceDetailsQuery organic information', () => {
  it('AC4: adds the organic sources once and marks organic farms for the date', async () => {
    const base = produceRecord();
    const zele = toProduce(
      'zele',
      produceRecord({
        organic: organicRecord({
          sources: [
            { name: 'Евростат – org_cropar', url: 'https://ec.europa.eu/eurostat/org_cropar' },
            base.nutrition.source,
          ],
        }),
      }),
    );
    const query = new ProduceDetailsQuery({
      produce: new IndexedRepository(async () => [zele]),
      groups: new IndexedRepository(async () => [
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: new IndexedRepository(async () => [
        toNutrient('vitamin-c', nutrient('Витамин C')),
        toNutrient('vitamin-k', nutrient('Витамин K')),
      ]),
      regions: new IndexedRepository(async () => [toRegion('plovdiv', { name: 'Пловдив' })]),
      farms: new IndexedFarmRepository(async () => [
        toFarm(
          'bio',
          farmRecord({ name: 'Био градина', produce: ['zele'], organic: certificateRecord() }),
        ),
        toFarm('obiknovena', farmRecord({ name: 'Обикновена', produce: ['zele'] })),
      ]),
    });
    const details = await query.forSlug('zele', new Date('2026-11-11'));
    const urls = details.sources.map((source) => source.url);
    expect(
      details.farms.map(({ farm, certifiedOrganic }) => [farm.slug, certifiedOrganic]),
    ).toEqual([
      ['bio', true],
      ['obiknovena', false],
    ]);
    const expired = await query.forSlug('zele', new Date('2027-01-01'));
    expect(expired.farms.every(({ certifiedOrganic }) => !certifiedOrganic)).toBe(true);
    expect(urls).toEqual([
      base.nutrition.source.url,
      ...base.traditionalUses.map((use) => use.source.url),
      'https://ec.europa.eu/eurostat/org_cropar',
    ]);
  });
});
