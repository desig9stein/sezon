import { describe, expect, it } from 'vitest';
import { NutrientRankingService } from '@contexts/catalog';
import { toNutrient, toProduce } from '@contexts/catalog/infrastructure/mappers';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { Month } from '@contexts/seasonality';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { testImage } from '@tests/fixtures/photos';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { MINIMAL_PRODUCE_INPUT, NUTRIENT_CLAIMS } from '@tests/fixtures/records';

describe('NutrientRankingService without nutrition (spec 049)', () => {
  it('AC6: skips produce without nutrition', async () => {
    const service = new NutrientRankingService(
      produceRepositoryOf([
        toProduce('hryan', produceSchemaWith({ image: testImage }).parse(MINIMAL_PRODUCE_INPUT)),
        aProduce({
          slug: 'zele',
          name: 'Зеле',
          season: [{ month: 11, level: 'peak' }],
          micronutrients: [{ nutrient: 'vitamin-c', amount: 36.6 }],
        }),
      ]),
      new IndexedRepository(async () => [
        toNutrient('vitamin-c', {
          name: 'Витамин C',
          kind: 'vitamin',
          unit: 'mg',
          referenceIntake: 80,
          ...NUTRIENT_CLAIMS,
        }),
      ]),
    );
    const ranking = await service.rankingFor('vitamin-c', Month.of(11));
    expect(ranking.entries.map((entry) => entry.produce.slug)).toEqual(['zele']);
    expect(ranking.inSeason.map((entry) => entry.produce.slug)).toEqual(['zele']);
  });
});
