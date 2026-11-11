import { describe, expect, it } from 'vitest';
import { websiteJsonLd } from '@shared/seo';

describe('websiteJsonLd search action', () => {
  it('AC2: declares the site search with its URL template', () => {
    expect(
      websiteJsonLd({ siteUrl: 'https://sezon.example', name: 'Сезон', description: 'Описание' })
        .potentialAction,
    ).toEqual({
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://sezon.example/tarsene?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    });
  });
});
