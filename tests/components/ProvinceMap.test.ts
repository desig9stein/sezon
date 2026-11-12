import { describe, expect, it } from 'vitest';
import ProvinceMap from '@components/produce/ProvinceMap.astro';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { BrokenReferenceError } from '@shared/domain/errors';
import { render } from './render';

const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });
const kyustendil = toRegion('kyustendil', { name: 'Кюстендил' });

describe('ProvinceMap', () => {
  it('AC2: renders 28 provinces with the given regions marked and a text alternative', async () => {
    const html = await render(ProvinceMap, { regions: [plovdiv, kyustendil] });
    expect(html).toMatch(/<figure[^>]*class="province-map"/);
    expect(html.match(/<path\b/g)).toHaveLength(28);
    expect(html.match(/data-marked="true"/g)).toHaveLength(2);
    expect(html).toMatch(/<path[^>]*data-region="plovdiv"[^>]*data-marked="true"/);
    const label = 'Карта на България. Отбелязани области: Пловдив, Кюстендил';
    expect(html).toMatch(new RegExp(`<svg[^>]*role="img"[^>]*aria-label="${label}"`));
    expect(html).toContain(`<title>${label}</title>`);
    expect(html).toMatch(/<svg[^>]*width="320"[^>]*height="209"/);
    expect(html).toMatch(/<figcaption[^>]*>[\s\S]*Natural Earth[\s\S]*<\/figcaption>/);
  });

  it('AC3: throws BrokenReferenceError for an unknown region', async () => {
    await expect(
      render(ProvinceMap, { regions: [toRegion('atlantida', { name: 'Атлантида' })] }),
    ).rejects.toThrow(BrokenReferenceError);
  });

  it('AC4: marks nothing when there are no regions', async () => {
    const html = await render(ProvinceMap, { regions: [] });
    expect(html).not.toContain('data-marked="true"');
    expect(html).toContain('aria-label="Карта на България. Няма отбелязани области"');
  });
});

describe('ProvinceMap QA (spec 026)', () => {
  it('AC2: names the SVG by its title, not by a duplicate aria-label', async () => {
    const html = await render(ProvinceMap, { regions: [plovdiv] });
    const id = /<svg[^>]*aria-labelledby="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeDefined();
    expect(html).toMatch(new RegExp(`<title id="${id}"[^>]*>Карта на България`));
    expect(html).not.toMatch(/<svg[^>]*aria-label=/);
  });

  it('AC2: derives the attribute height from the viewBox', async () => {
    const html = await render(ProvinceMap, { regions: [] });
    const [, , , width, height] = /viewBox="(\d+) (\d+) (\d+) (\d+)"/.exec(html)?.map(Number) ?? [];
    const attrHeight = Number(/<svg[^>]*height="(\d+)"/.exec(html)?.[1]);
    expect(attrHeight).toBe(Math.round((320 * (height ?? 0)) / (width ?? 1)));
  });

  it('AC15: the caption describes the map before crediting the source', async () => {
    const html = await render(ProvinceMap, { regions: [plovdiv] });
    expect(html).toMatch(/<figcaption[^>]*>\s*Оцветени са областите/);
  });
});
