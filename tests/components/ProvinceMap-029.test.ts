import { describe, expect, it } from 'vitest';
import ProvinceMap from '@components/produce/ProvinceMap.astro';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { render } from './render';

const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });
const pleven = toRegion('pleven', { name: 'Плевен' });
const svgOf = (html: string) => /<svg[\s\S]*<\/svg>/.exec(html)?.[0] ?? '';

describe('ProvinceMap links (spec 029)', () => {
  it('AC4: links the given provinces with their names and hides the rest', async () => {
    const html = await render(ProvinceMap, {
      regions: [plovdiv],
      links: [
        { region: plovdiv, href: '/regioni/plovdiv' },
        { region: pleven, href: '/regioni/pleven' },
      ],
    });
    expect(html).toMatch(/<svg[^>]*role="group"/);
    expect(html).not.toMatch(/<svg[^>]*role="img"/);
    const links = [...svgOf(html).matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
    expect(links).toHaveLength(2);
    expect(links.join('\n')).toMatch(
      /href="\/regioni\/plovdiv"[^>]*aria-label="Пловдив"|aria-label="Пловдив"[^>]*href="\/regioni\/plovdiv"/,
    );
    expect(links.join('\n')).toMatch(
      /href="\/regioni\/pleven"[^>]*aria-label="Плевен"|aria-label="Плевен"[^>]*href="\/regioni\/pleven"/,
    );
    expect(html.match(/<path[^>]*aria-hidden="true"/g)).toHaveLength(26);
  });

  it('AC5: stays an image without links', async () => {
    const html = await render(ProvinceMap, { regions: [plovdiv] });
    expect(html).toMatch(/<svg[^>]*role="img"/);
    expect(svgOf(html)).not.toMatch(/<a\b/);
  });

  it('AC6: fills marked provinces with the hatch pattern', async () => {
    const html = await render(ProvinceMap, { regions: [plovdiv] });
    const id = /<pattern[^>]*id="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeDefined();
    expect(html).toMatch(new RegExp(`<path[^>]*data-region="plovdiv"[^>]*fill="url\\(#${id}\\)"`));
    expect(html).not.toMatch(
      new RegExp(`<path[^>]*data-region="pleven"[^>]*fill="url\\(#${id}\\)"`),
    );
  });
});
