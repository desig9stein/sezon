import { describe, expect, it } from 'vitest';
import { ProduceDetailsQuery } from '@composition/ProduceDetailsQuery';
import { toNutrient, toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { growingRecord } from '@tests/fixtures/growing';
import { NUTRIENT_CLAIMS, produceRecord } from '@tests/fixtures/records';

const nutrient = (name: string) => ({
  name,
  kind: 'vitamin' as const,
  unit: 'mg' as const,
  referenceIntake: 80,
  ...NUTRIENT_CLAIMS,
});

describe('ProduceDetailsQuery growing source', () => {
  it('AC5: adds every growing source to the page sources once, after the others', async () => {
    const base = produceRecord();
    const zele = toProduce(
      'zele',
      produceRecord({
        growing: growingRecord({
          sources: [
            { name: 'Агрозона – Отглеждане на зеле', url: 'https://agrozona.bg/zele' },
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
      farms: new IndexedFarmRepository(async () => []),
    });
    const urls = (await query.forSlug('zele')).sources.map((source) => source.url);
    expect(urls).toEqual([
      base.nutrition.source.url,
      ...base.traditionalUses.map((use) => use.source.url),
      'https://agrozona.bg/zele',
    ]);
  });
});
