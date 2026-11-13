import { describe, expect, it } from 'vitest';
import provinceMap from '../../src/assets/map/provinces.json';
import ProvinceMap from '@components/produce/ProvinceMap.astro';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { render } from './render';

const all = Object.keys(provinceMap.provinces).map((slug) => toRegion(slug, { name: slug }));

describe('ProvinceMap QA (spec 038)', () => {
  it('AC18: names the map briefly when every province is marked and linked', async () => {
    const html = await render(ProvinceMap, {
      regions: all,
      links: all.map((region) => ({ region, href: `/regioni/${region.slug}` })),
    });
    const title = /<title[^>]*>([^<]*)<\/title>/.exec(html)?.[1];
    expect(title).toBe('Карта на България. Отбелязани са всички 28 области.');
  });
});
