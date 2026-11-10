import { describe, expect, it } from 'vitest';
import { Month } from '@contexts/seasonality';
import { routes } from '@components/layout/routes';

describe('routes', () => {
  it.each([
    ['fruit', '/plodove/yabalki'],
    ['vegetable', '/zelenchutsi/yabalki'],
    ['herb', '/podpravki/yabalki'],
    ['nut', '/yadki/yabalki'],
  ] as const)('AC4: builds the produce URL for kind %s', (kind, path) => {
    expect(routes.produce({ kind, slug: 'yabalki' })).toBe(path);
  });

  it('builds month and home paths', () => {
    expect(routes.home).toBe('/');
    expect(routes.month(Month.of(11))).toBe('/sezon/noemvri');
  });

  it.each([
    ['fruit', 'plodove'],
    ['vegetable', 'zelenchutsi'],
    ['herb', 'podpravki'],
    ['nut', 'yadki'],
  ] as const)('AC10 (spec 005): returns the URL section for kind %s', (kind, section) => {
    expect(routes.produceSection(kind)).toBe(section);
  });

  it('AC5 (spec 011): returns the nutrient page path', () => {
    expect(routes.nutrient('vitamin-c')).toBe('/nutrienti/vitamin-c');
  });
});
