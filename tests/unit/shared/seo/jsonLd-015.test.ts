import { describe, expect, it } from 'vitest';
import { articleJsonLd } from '@shared/seo/jsonLd';

const INPUT = {
  siteUrl: 'https://sezon.example',
  path: '/zelenchutsi/zele',
  headline: 'Зеле',
  description: 'Описание',
  dateModified: new Date('2026-11-10'),
  about: { name: 'Зеле' },
  citations: [],
};

describe('articleJsonLd image', () => {
  it('AC6: adds the absolute image URL when an image path is given', () => {
    expect(articleJsonLd({ ...INPUT, imagePath: '/_astro/zele.hash.jpg' }).image).toBe(
      'https://sezon.example/_astro/zele.hash.jpg',
    );
  });

  it('AC6: leaves the image out without an image path', () => {
    expect(articleJsonLd(INPUT)).not.toHaveProperty('image');
  });
});
