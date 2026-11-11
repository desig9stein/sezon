import { describe, expect, it } from 'vitest';
import NutrientInSeason from '@components/nutrients/NutrientInSeason.astro';
import { NutrientRankingService } from '@contexts/catalog';
import { toNutrient } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';
import { render } from './render';

const service = new NutrientRankingService(
  produceRepositoryOf([
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

describe('NutrientInSeason', () => {
  it('QA 011: lists fresh produce with a claim, linked, with the claim label', async () => {
    const html = await render(NutrientInSeason, {
      ranking: await service.rankingFor('vitamin-c', Month.of(11)),
    });
    expect(html).toMatch(/<section[^>]*aria-labelledby="in-season"/);
    expect(html).toMatch(/<h2[^>]*id="in-season"[^>]*>\s*В сезон сега\s*<\/h2>/);
    expect(html).toContain('href="/zelenchutsi/zele"');
    expect(html).toContain('Високо съдържание на витамин C');
  });

  it('QA 011: renders nothing when nothing is in season', async () => {
    const html = await render(NutrientInSeason, {
      ranking: await service.rankingFor('vitamin-c', Month.of(4)),
    });
    expect(html.trim()).toBe('');
  });
});
