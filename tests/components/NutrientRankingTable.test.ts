import { describe, expect, it } from 'vitest';
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
    aProduce({
      slug: 'praz',
      name: 'Праз',
      season: [{ month: 11, level: 'available' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 12 }],
    }),
    aProduce({
      slug: 'morkovi',
      name: 'Моркови',
      season: [{ month: 5, level: 'peak' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 5.9 }],
    }),
    aProduce({
      slug: 'tikva',
      name: 'Тиква',
      season: [{ month: 11, level: 'storage' }],
      micronutrients: [{ nutrient: 'vitamin-c', amount: 11.9 }],
    }),
  ]),
  new IndexedRepository(async () => [
    toNutrient('folat', {
      name: 'Фолат',
      kind: 'vitamin',
      unit: 'µg',
      referenceIntake: 200,
      ...NUTRIENT_CLAIMS,
    }),
    toNutrient('vitamin-c', {
      name: 'Витамин C',
      kind: 'vitamin',
      unit: 'mg',
      referenceIntake: 80,
      ...NUTRIENT_CLAIMS,
    }),
  ]),
);

describe('NutrientRankingTable', () => {
  it('AC7: renders caption, headers, amounts, percent, claims and season levels', async () => {
    const html = await render(NutrientRankingTable, {
      ranking: await service.rankingFor('vitamin-c', Month.of(11)),
    });

    expect(html).toMatch(/<caption[^>]*>\s*Витамин C на 100 г\s*<\/caption>/);
    expect(html.match(/<th[^>]*scope="col"/g)).toHaveLength(5);
    expect(html.match(/<th[^>]*scope="row"/g)).toHaveLength(4);
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>\s*<a href="\/zelenchutsi\/zele"[^>]*>Зеле<\/a>/,
    );
    expect(html).toContain('36,6 мг');
    expect(html).toContain('46%');
    expect(html).toContain('Високо съдържание на витамин C');
    expect(html).toContain('Източник на витамин C');
    expect(html).toContain('под прага за претенция');
    expect(html).toContain('Разгар на сезона');
    expect(html).toContain('Извън сезона');
    expect(html.indexOf('Зеле')).toBeLessThan(html.indexOf('Праз'));
    expect(html.indexOf('Праз')).toBeLessThan(html.indexOf('Моркови'));
    expect(html).toMatch(/<section[^>]*aria-labelledby="[^"]+"[^>]*tabindex="0"/);
  });

  it('QA 011: shows one decimal when the rounded percent would reach a claim threshold', async () => {
    const html = await render(NutrientRankingTable, {
      ranking: await service.rankingFor('vitamin-c', Month.of(11)),
    });
    expect(html).toContain('14,8%');
    const tikvaRow = html.slice(
      html.indexOf('Тиква'),
      html.indexOf('</tr>', html.indexOf('Тиква')),
    );
    expect(tikvaRow).toContain('14,8%');
    expect(tikvaRow).not.toMatch(/>\s*15%\s*</);
  });

  it('QA 011: renders the empty-state text when no produce lists the nutrient', async () => {
    const html = await render(NutrientRankingTable, {
      ranking: await service.rankingFor('folat', Month.of(11)),
    });
    expect(html).toContain('Все още няма продукти с данни за фолат.');
    expect(html).not.toContain('<table');
  });
});
