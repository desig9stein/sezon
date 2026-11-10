import { describe, expect, it } from 'vitest';
import SectionIndex from '@components/produce/SectionIndex.astro';
import { SectionIndexService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { render } from './render';

const service = new SectionIndexService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'spanak', name: 'Спанак', season: [{ month: 4, level: 'peak' }] }),
  ]),
);

describe('SectionIndex', () => {
  it('AC6: renders one labelled section per non-empty group with cards', async () => {
    const html = await render(SectionIndex, {
      section: await service.sectionFor('vegetable', Month.of(11)),
    });

    const sections = [...html.matchAll(/<section[^>]*aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
    expect(sections).toHaveLength(2);
    for (const id of sections) expect(html).toMatch(new RegExp(`<h2[^>]*id="${id}"`));
    expect(html).toContain('В разгара на сезона');
    expect(html).toContain('Извън сезона през ноември');
    expect(html).not.toContain('Също в сезон');
    expect(html).toMatch(/<ul[^>]*role="list"/);
    expect(html).toContain('href="/zelenchutsi/zele"');
    expect(html).toContain('href="/zelenchutsi/spanak"');
    expect(html.match(/season-badge/g)?.length).toBeGreaterThanOrEqual(1);
    const outOfSeason = html.slice(html.indexOf('Извън сезона през ноември'));
    expect(outOfSeason).not.toContain('season-badge');
  });

  it('AC6: shows the empty state when the kind has no produce', async () => {
    const html = await render(SectionIndex, {
      section: await service.sectionFor('nut', Month.of(11)),
    });

    expect(html).toContain('Все още няма добавени продукти в този раздел.');
    expect(html).not.toMatch(/<section/);
  });
});
