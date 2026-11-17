import { describe, expect, it } from 'vitest';
import ProvinceMap from '@components/produce/ProvinceMap.astro';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { render } from './render';

const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });
const pleven = toRegion('pleven', { name: 'Плевен' });
const links = [
  { region: plovdiv, href: '/regioni/plovdiv' },
  { region: pleven, href: '/regioni/pleven' },
];
const svgOf = (html: string) => /<svg[\s\S]*<\/svg>/.exec(html)?.[0] ?? '';
const anchorsOf = (svg: string) => [...svg.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);

describe('ProvinceMap keyboard path (spec 060)', () => {
  it('AC8: with the list as the keyboard path, the map is an image with hidden, untabbable links', async () => {
    const svg = svgOf(
      await render(ProvinceMap, { regions: [plovdiv], links, keyboardPath: 'list' }),
    );
    expect(svg).toMatch(/^<svg[^>]*role="img"/);
    const anchors = anchorsOf(svg);
    expect(anchors).toHaveLength(2);
    for (const anchor of anchors) expect(anchor).toContain('tabindex="-1"');
    const layer = /<g[^>]*aria-hidden="true"[^>]*data-links[^>]*>([\s\S]*?)<\/g>/.exec(svg)?.[1];
    expect(layer?.match(/<a\b/g)).toHaveLength(2);
  });

  it('AC8: by default the map links stay tabbable (spec 029)', async () => {
    const svg = svgOf(await render(ProvinceMap, { regions: [plovdiv], links }));
    expect(svg).toMatch(/^<svg[^>]*role="group"/);
    for (const anchor of anchorsOf(svg)) expect(anchor).not.toContain('tabindex');
  });
});
