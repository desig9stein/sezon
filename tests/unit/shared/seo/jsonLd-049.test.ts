import { describe, expect, it } from 'vitest';
import { articleJsonLd } from '@shared/seo/jsonLd';

const INPUT = {
  siteUrl: 'https://sezon.example',
  path: '/zelenchutsi/hryan',
  headline: 'Хрян',
  description: 'Описание',
  dateModified: new Date('2026-11-13'),
  about: { name: 'Хрян' },
};

describe('articleJsonLd citations (spec 049)', () => {
  it('AC9: leaves the citation out when there are no citations', () => {
    expect(articleJsonLd({ ...INPUT, citations: [] })).not.toHaveProperty('citation');
  });

  it('AC9: keeps the citations when there are some', () => {
    const citations = [{ name: 'USDA', url: 'https://fdc.nal.usda.gov/' }];
    expect(articleJsonLd({ ...INPUT, citations }).citation).toEqual([
      { '@type': 'CreativeWork', name: 'USDA', url: 'https://fdc.nal.usda.gov/' },
    ]);
  });
});
