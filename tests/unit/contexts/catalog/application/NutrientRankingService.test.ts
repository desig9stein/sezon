import { describe, expect, it } from 'vitest';
import { NutrientRankingService } from '@contexts/catalog';
import { toNutrient } from '@contexts/catalog/infrastructure/mappers';
import { Month, SeasonLevel } from '@contexts/seasonality';
import { NutrientNotFoundError } from '@shared/domain/errors';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';

const nutrient = (slug: string, name: string, referenceIntake: number) =>
  toNutrient(slug, { name, kind: 'vitamin', unit: 'mg', referenceIntake, ...NUTRIENT_CLAIMS });

const service = new NutrientRankingService(
  produceRepositoryOf([
    aProduce({
      slug: 'zele',
      name: 'Зеле',
      season: [{ month: 11, level: 'peak' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 36.6 }],
    }),
    aProduce({
      slug: 'praz',
      name: 'Праз',
      season: [{ month: 11, level: 'available' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 12 }],
    }),
    aProduce({
      slug: 'tikva',
      name: 'Тиква',
      season: [{ month: 11, level: 'storage' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 36.6 }],
    }),
    aProduce({
      slug: 'morkovi',
      name: 'Моркови',
      season: [{ month: 5, level: 'peak' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 5.9 }],
    }),
    aProduce({
      slug: 'spanak',
      name: 'Спанак',
      season: [{ month: 11, level: 'peak' }],
      micronutrients: [{ nutrient: 'vitamin-k', amount: 482 }],
    }),
  ]),
  new IndexedRepository(async () => [
    nutrient('vitamin-c', 'Витамин C', 80),
    nutrient('vitamin-k', 'Витамин K', 75),
    nutrient('folat', 'Фолат', 200),
  ]),
);

describe('NutrientRankingService', () => {
  it('AC2: ranks produce containing the nutrient by amount, with percent, claim and season', async () => {
    const ranking = await service.rankingFor('vitamin-c', Month.of(11));

    expect(ranking.nutrient.slug).toBe('vitamin-c');
    expect(ranking.month.number).toBe(11);
    expect(
      ranking.entries.map((entry) => [
        entry.produce.slug,
        entry.amount,
        entry.percentOfReferenceIntake,
        entry.claimLevel,
        entry.seasonLevel,
      ]),
    ).toEqual([
      ['zele', 36.6, 46, 'high', SeasonLevel.PEAK],
      ['tikva', 36.6, 46, 'high', SeasonLevel.STORAGE],
      ['praz', 12, 15, 'source', SeasonLevel.AVAILABLE],
      ['morkovi', 5.9, 7, undefined, undefined],
    ]);
    expect(ranking.inSeason.map((entry) => entry.produce.slug)).toEqual(['zele', 'praz']);
    expect(Object.isFrozen(ranking.entries)).toBe(true);
  });

  it('AC2: returns an empty ranking for a nutrient no produce lists', async () => {
    const ranking = await service.rankingFor('folat', Month.of(11));

    expect(ranking.entries).toEqual([]);
    expect(ranking.inSeason).toEqual([]);
  });

  it('AC3: throws for an unknown nutrient and lists every nutrient', async () => {
    await expect(service.rankingFor('vitamin-z', Month.of(11))).rejects.toThrow(
      NutrientNotFoundError,
    );
    expect((await service.allNutrients()).map((item) => item.slug)).toEqual(
      expect.arrayContaining(['vitamin-c', 'vitamin-k', 'folat']),
    );
  });
});
