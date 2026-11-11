import { describe, expect, it } from 'vitest';
import SeasonOverview from '@components/season/SeasonOverview.astro';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'morkovi', name: 'Моркови', season: [{ month: 11, level: 'available' }] }),
  ]),
);

describe('SeasonOverview (spec 013)', () => {
  it('AC4: renders peak as plates with summaries and other groups as an index', async () => {
    const html = await render(SeasonOverview, {
      overview: await service.overviewFor(Month.of(11)),
    });

    const [peak = '', available = ''] = html.split('<section').slice(1);
    expect(peak).toContain('data-variant="plates"');
    expect(peak.match(/produce-card__summary/g)).toHaveLength(2);
    expect(available).toContain('data-variant="index"');
    expect(available).not.toContain('produce-card__summary');
    expect(available).toContain('season-badge');
  });
});
