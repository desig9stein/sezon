import { describe, expect, it } from 'vitest';
import SeasonOverview from '@components/season/SeasonOverview.astro';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
  ]),
);

describe('SeasonOverview (spec 059)', () => {
  it('AC1: shows no empty text when only the selected groups are empty', async () => {
    const html = await render(SeasonOverview, {
      overview: await service.overviewFor(Month.of(11)),
      groups: ['comingSoon'],
    });
    expect(html).not.toContain('Няма данни за този месец.');
    expect(html).not.toMatch(/<section/);
  });

  it('AC1: shows the empty text when the whole month is empty', async () => {
    const html = await render(SeasonOverview, {
      overview: await service.overviewFor(Month.of(6)),
      groups: ['comingSoon'],
    });
    expect(html).toContain('Няма данни за този месец.');
  });
});
