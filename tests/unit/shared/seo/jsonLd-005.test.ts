import { describe, expect, it } from 'vitest';
import { articleJsonLd, faqPageJsonLd } from '@shared/seo/jsonLd';

const SITE = 'https://sezon.example';

describe('articleJsonLd', () => {
  it('AC5: describes the page as an Article about the produce', () => {
    expect(
      articleJsonLd({
        siteUrl: SITE,
        path: '/zelenchutsi/zele',
        headline: 'Зеле',
        description: 'Описание',
        dateModified: new Date('2026-11-10'),
        about: { name: 'Зеле', alternateName: 'Brassica oleracea' },
        citations: [{ name: 'USDA', url: 'https://fdc.nal.usda.gov/' }],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Зеле',
      description: 'Описание',
      inLanguage: 'bg',
      dateModified: '2026-11-10',
      mainEntityOfPage: 'https://sezon.example/zelenchutsi/zele',
      about: { '@type': 'Thing', name: 'Зеле', alternateName: 'Brassica oleracea' },
      citation: [{ '@type': 'CreativeWork', name: 'USDA', url: 'https://fdc.nal.usda.gov/' }],
    });
  });
});

describe('faqPageJsonLd', () => {
  it('AC5: lists questions with accepted answers', () => {
    expect(faqPageJsonLd([{ question: 'Кога?', answer: 'Есента.' }])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Кога?',
          acceptedAnswer: { '@type': 'Answer', text: 'Есента.' },
        },
      ],
    });
  });
});
