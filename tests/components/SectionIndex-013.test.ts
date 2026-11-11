import { describe, expect, it } from 'vitest';
import SectionIndex from '@components/produce/SectionIndex.astro';
import { SectionIndexService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SectionIndexService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'available' }] }),
  ]),
);

describe('SectionIndex (spec 013)', () => {
  it('AC4: renders peak as plates and the other groups as an index', async () => {
    const html = await render(SectionIndex, {
      section: await service.sectionFor('vegetable', Month.of(11)),
    });
    const [peak = '', available = ''] = html.split('<section').slice(1);
    expect(peak).toContain('data-variant="plate"');
    expect(available).toContain('data-variant="index"');
  });

  it('AC4: renders no plates when nothing is at its peak', async () => {
    const html = await render(SectionIndex, {
      section: await service.sectionFor('vegetable', Month.of(4)),
    });
    expect(html).not.toContain('data-variant="plate"');
    expect(html).toContain('data-variant="index"');
  });
});
