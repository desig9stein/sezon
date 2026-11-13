import { describe, expect, it } from 'vitest';
import GrowingRegions from '@components/produce/GrowingRegions.astro';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { ui } from '@i18n/bg';
import { render } from './render';

const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });
const pleven = toRegion('pleven', { name: 'Плевен' });
const svgOf = (html: string) => /<svg[\s\S]*<\/svg>/.exec(html)?.[0] ?? '';

describe('GrowingRegions (spec 042)', () => {
  it('AC2: lists each region with its link and note, and links it on the map', async () => {
    const html = await render(GrowingRegions, {
      regions: [
        { region: plovdiv, note: 'Най-голяма площ.' },
        { region: pleven, note: 'Втора по площ.' },
      ],
    });
    expect(html.match(/<li[\s>]/g)).toHaveLength(2);
    for (const text of [
      'href="/regioni/plovdiv"',
      'href="/regioni/pleven"',
      'Най-голяма площ.',
      'Втора по площ.',
    ]) {
      expect(html).toContain(text);
    }
    expect(svgOf(html)).toMatch(/<a\b[^>]*href="\/regioni\/plovdiv"/);
  });

  it('QA 042: the list carries the component’s own scoped style', async () => {
    const html = await render(GrowingRegions, { regions: [{ region: plovdiv, note: 'Бележка.' }] });
    expect(html).toMatch(/<ul[^>]*data-astro-cid-/);
  });

  it('AC3: without regions, says there is no official data and draws neither list nor map', async () => {
    const html = await render(GrowingRegions, { regions: [] });
    expect(html).toContain(ui.produce.regionsEmpty);
    expect(html).not.toMatch(/<ul[\s>]/);
    expect(html).not.toContain('<svg');
  });
});
