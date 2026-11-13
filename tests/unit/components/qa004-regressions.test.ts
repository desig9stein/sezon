import { describe, expect, it } from 'vitest';
import { freshProduceItemList } from '@components/season/seasonJsonLd';
import { routes } from '@components/layout/routes';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { ui } from '@i18n/bg';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'available' }] }),
    aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'peak' }] }),
    aProduce({
      slug: 'yabalki',
      name: 'Ябълки',
      kind: 'fruit',
      season: [
        { month: 11, level: 'storage' },
        { month: 12, level: 'peak' },
      ],
    }),
  ]),
);

describe('QA 004 regressions', () => {
  it('freshProduceItemList lists peak then available produce with absolute URLs', async () => {
    const list = freshProduceItemList(
      await service.overviewFor(Month.of(11)),
      'https://sezon.example',
    );
    expect(list).toMatchObject({
      '@type': 'ItemList',
      name: 'В сезон през ноември',
      itemListElement: [
        { position: 1, name: 'Праз', url: 'https://sezon.example/zelenchutsi/praz' },
        { position: 2, name: 'Зеле', url: 'https://sezon.example/zelenchutsi/zele' },
      ],
    });
  });

  it('freshProduceItemList returns undefined when nothing is fresh', async () => {
    expect(
      freshProduceItemList(await service.overviewFor(Month.of(6)), 'https://sezon.example'),
    ).toBeUndefined();
  });

  it('produce in storage now and fresh next month stays in storage only', async () => {
    const overview = await service.overviewFor(Month.of(11));
    expect(overview.storage.map((p) => p.slug)).toEqual(['yabalki']);
    expect(overview.comingSoon).toEqual([]);
  });

  it('the routes helper exposes only route builders in use', () => {
    expect(Object.keys(routes).sort()).toEqual([
      'about',
      'addFarm',
      'calendar',
      'catalog',
      'farm',
      'farms',
      'feed',
      'group',
      'home',
      'methodology',
      'month',
      'nutrient',
      'produce',
      'produceSection',
      'recipe',
      'recipes',
      'region',
      'regions',
      'reportError',
      'search',
      'section',
    ]);
  });

  it('page strings use the month name', () => {
    const november = Month.of(11);
    expect(ui.home.heading(november)).toBe('В сезон през ноември');
    expect(ui.home.fullMonthLink(november)).toBe('Виж всичко в сезон през ноември');
    expect(ui.home.nextMonthLink(Month.of(12))).toBe('Виж какво идва през декември');
    expect(ui.monthPage.title(november)).toBe('Какво е в сезон през ноември');
    expect(ui.monthPage.heading(november)).toBe('Какво е в сезон през ноември');
    expect(ui.overview.available).toBe('Също в сезон');
    expect(ui.overview.fromMonth(Month.of(12), 'Разгар на сезона')).toBe(
      'От декември: Разгар на сезона',
    );
  });

  it('descriptions do not promise farm content', () => {
    for (const month of Month.all()) {
      expect(ui.home.description(month)).not.toContain('ферм');
      expect(ui.monthPage.description(month, ['Зеле'])).not.toContain('ферм');
    }
  });

  it('description keeps later names that fit after a long one', () => {
    const description = ui.monthPage.description(Month.of(8), ['Б'.repeat(120), 'Зеле']);
    expect(description).toContain('Зеле');
    expect(description).not.toContain('Б'.repeat(120));
  });
});
