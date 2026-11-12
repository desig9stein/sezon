import { describe, expect, it } from 'vitest';
import { webPageJsonLd } from '@shared/seo';

describe('webPageJsonLd (spec 031)', () => {
  it('AC9: describes an about page in Bulgarian with an absolute URL', () => {
    expect(
      webPageJsonLd({
        siteUrl: 'https://sezon.example',
        path: '/za-nas',
        type: 'AboutPage',
        name: 'За Сезон',
        description: 'Описание.',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'За Сезон',
      description: 'Описание.',
      url: 'https://sezon.example/za-nas',
      inLanguage: 'bg',
    });
  });
});
