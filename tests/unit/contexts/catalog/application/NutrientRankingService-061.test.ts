import { describe, expect, it } from 'vitest';
import { NutrientRankingService } from '@contexts/catalog';
import { toNutrient } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';

const AMOUNTS: ReadonlyArray<readonly [string, number]> = [
  ['zele', 36.6],
  ['praz', 12],
  ['morkovi', 5.9],
];

const service = new NutrientRankingService(
  produceRepositoryOf(
    AMOUNTS.map(([slug, amount]) =>
      aProduce({
        slug,
        name: slug,
        season: [{ month: 11, level: 'peak' }],
        micronutrients: [{ nutrient: 'vitamin-c', amount }],
      }),
    ),
  ),
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

describe('nutrient ranking coverage (spec 061)', () => {
  it('AC11: ranks only produce that reach the 15 % claim threshold', async () => {
    const ranking = await service.rankingFor('vitamin-c', Month.of(11));
    expect(ranking.entries.map((entry) => entry.amount)).toEqual([36.6, 12]);
    expect(ranking.entries.every((entry) => entry.claimLevel !== undefined)).toBe(true);
  });
});
