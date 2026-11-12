import { describe, expect, it } from 'vitest';
import FarmCard from '@components/produce/FarmCard.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

describe('FarmCard (spec 030)', () => {
  it('AC6: links the farm name to the farm page', async () => {
    const html = await render(FarmCard, {
      farm: toFarm('venets', farmRecord({ name: 'Венец', region: 'pleven' })),
      region: toRegion('pleven', { name: 'Плевен' }),
      certifiedOrganic: false,
      headingLevel: 3,
    });
    expect(html).toMatch(/<h3[^>]*>\s*<a[^>]*href="\/fermi\/venets"[^>]*>Венец<\/a>\s*<\/h3>/);
  });
});
