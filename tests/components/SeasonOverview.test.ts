import { describe, expect, it } from 'vitest';
import SeasonOverview from '@components/season/SeasonOverview.astro';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'spanak', name: 'Спанак', season: [{ month: 12, level: 'available' }] }),
  ]),
);

describe('SeasonOverview', () => {
  it('AC7: renders one labelled section per non-empty group with a list of cards', async () => {
    const html = await render(SeasonOverview, {
      overview: await service.overviewFor(Month.of(11)),
    });
    const sections = [...html.matchAll(/<section[^>]*aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
    expect(sections).toHaveLength(2);
    for (const id of sections) {
      expect(html).toMatch(new RegExp(`<h2[^>]*id="${id}"`));
    }
    expect(html).toContain('В разгара на сезона');
    expect(html).toContain('Идват скоро');
    expect(html).not.toContain('От хранилище');
    expect(html).toMatch(/<ul[^>]*role="list"/);
    expect(html.match(/<li\b/g)).toHaveLength(2);
  });

  it('AC7: shows the empty state when every group is empty', async () => {
    const html = await render(SeasonOverview, { overview: await service.overviewFor(Month.of(6)) });
    expect(html).toContain('Няма данни за този месец.');
    expect(html).not.toMatch(/<section/);
  });
});
