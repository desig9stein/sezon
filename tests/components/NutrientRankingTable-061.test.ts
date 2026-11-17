import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import NutrientRankingTable from '@components/nutrients/NutrientRankingTable.astro';
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

describe('nutrient ranking source line (spec 061)', () => {
  it('AC10: names USDA FoodData Central, SR Legacy under the table, with a link', async () => {
    const html = await render(NutrientRankingTable, {
      ranking: await service.rankingFor('vitamin-c', Month.of(11)),
    });
    const window = new Window();
    window.document.write(`<main>${html}</main>`);
    const note = [...window.document.querySelectorAll('p')].find((p) =>
      p.textContent?.includes('Източник:'),
    );
    expect(note?.textContent?.replace(/\s+/g, ' ')).toContain(
      'Източник: USDA FoodData Central, SR Legacy (по продукт)',
    );
    expect(note?.querySelector('a')?.getAttribute('href')).toMatch(
      /^https:\/\/fdc\.nal\.usda\.gov\//,
    );
    expect(html.indexOf('</table>')).toBeLessThan(html.indexOf('Източник:'));
  });
});
