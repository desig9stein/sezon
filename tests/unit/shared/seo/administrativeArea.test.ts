import { describe, expect, it } from 'vitest';
import { administrativeAreaJsonLd } from '@shared/seo';

describe('administrativeAreaJsonLd (spec 029)', () => {
  it('AC8: describes a province contained in Bulgaria with an absolute URL', () => {
    expect(
      administrativeAreaJsonLd({
        siteUrl: 'https://sezon.example',
        path: '/regioni/plovdiv',
        name: 'Пловдив',
        description: 'Какво се отглежда в Пловдив.',
        country: 'България',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'AdministrativeArea',
      name: 'Пловдив',
      description: 'Какво се отглежда в Пловдив.',
      url: 'https://sezon.example/regioni/plovdiv',
      containedInPlace: { '@type': 'Country', name: 'България' },
    });
  });
});
