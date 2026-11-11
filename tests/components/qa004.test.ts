import { describe, expect, it } from 'vitest';
import SeasonOverview from '@components/season/SeasonOverview.astro';
import SiteFooter from '@components/layout/SiteFooter.astro';
import SiteHeader from '@components/layout/SiteHeader.astro';
import Breadcrumbs from '@components/layout/Breadcrumbs.astro';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'orehi', name: 'Орехи', kind: 'nut', season: [{ month: 9, level: 'peak' }] }),
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 8, level: 'peak' }] }),
  ]),
);

describe('QA 004 regressions (components)', () => {
  it("coming-soon cards label next month's level with the month", async () => {
    const html = await render(SeasonOverview, { overview: await service.overviewFor(Month.of(8)) });
    const comingSoon = html.slice(html.indexOf('Идват скоро'));
    expect(comingSoon).toContain('От септември: Разгар');
  });

  it('can limit the groups that are rendered', async () => {
    const html = await render(SeasonOverview, {
      overview: await service.overviewFor(Month.of(8)),
      groups: ['comingSoon'],
    });
    expect(html).toContain('Идват скоро');
    expect(html).not.toContain('В разгара на сезона');
  });

  it.each([
    ['SiteHeader', SiteHeader, { currentPath: '/' }],
    ['SiteFooter', SiteFooter, {}],
    [
      'Breadcrumbs',
      Breadcrumbs,
      {
        items: [
          { name: 'Начало', path: '/' },
          { name: 'X', path: '/x' },
        ],
      },
    ],
  ] as const)('%s keeps list semantics on unstyled lists', async (_name, component, props) => {
    const html = await render(component, props);
    expect(html).toMatch(/<(ul|ol)[^>]*role="list"/);
  });
});
