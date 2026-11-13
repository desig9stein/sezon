import { describe, expect, it } from 'vitest';
import GrowingRegions from '@components/produce/GrowingRegions.astro';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { ui } from '@i18n/bg';
import { render } from './render';

const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });

describe('GrowingRegions (spec 042)', () => {
  it('AC2: lists each region with its link and note, and draws the map', async () => {
    const html = await render(GrowingRegions, {
      regions: [{ region: plovdiv, note: 'Най-голяма площ.' }],
    });
    expect(html).toContain('href="/regioni/plovdiv"');
    expect(html).toContain('Най-голяма площ.');
    expect(html).toMatch(/<ul[\s>]/);
    expect(html).toContain('<svg');
  });

  it('AC3: without regions, says there is no official data and draws neither list nor map', async () => {
    const html = await render(GrowingRegions, { regions: [] });
    expect(html).toContain(ui.produce.regionsEmpty);
    expect(html).not.toMatch(/<ul[\s>]/);
    expect(html).not.toContain('<svg');
  });
});
