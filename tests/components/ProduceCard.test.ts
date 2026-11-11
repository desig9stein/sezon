import { describe, expect, it } from 'vitest';
import ProduceCard from '@components/produce/ProduceCard.astro';
import { SeasonLevel } from '@contexts/seasonality';
import { aProduce } from '@tests/fixtures/produce';
import { render } from './render';

const produce = aProduce({
  slug: 'yabalki',
  name: 'Ябълки',
  kind: 'fruit',
  season: [{ month: 9, level: 'peak' }],
});

describe('ProduceCard', () => {
  it('AC6: renders a heading link to the produce page, the kind and the badge', async () => {
    const html = await render(ProduceCard, { produce, level: SeasonLevel.PEAK });
    expect(html).toMatch(/<h3[^>]*>\s*<a[^>]*href="\/plodove\/yabalki"[^>]*>Ябълки<\/a>\s*<\/h3>/);
    expect(html).toContain('Плод');
    expect(html).toContain('Разгар на сезона');
  });

  it('AC6: uses the configured heading level and omits the badge without a level', async () => {
    const html = await render(ProduceCard, { produce, headingLevel: 2 });
    expect(html).toMatch(/<h2[^>]*>\s*<a[^>]*href="\/plodove\/yabalki"/);
    expect(html).not.toContain('data-level=');
  });

  it('AC5 (spec 013): renders the Latin name in Latin', async () => {
    const html = await render(ProduceCard, { produce });
    expect(html).toMatch(/<i[^>]*lang="la"[^>]*>Brassica oleracea var\. capitata<\/i>/);
  });
});
