import { describe, expect, it } from 'vitest';
import { breadcrumbListJsonLd, serializeJsonLd, websiteJsonLd } from '@shared/seo/jsonLd';
import { InvalidPageMetaError } from '@shared/domain/errors';

const SITE = 'https://sezon.example';

describe('serializeJsonLd', () => {
  it('AC3: escapes characters that could break out of a script element', () => {
    const value = { name: '</script><script>alert(1)</script> & \u2028\u2029 >' };
    const json = serializeJsonLd(value);
    expect(json).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(json)).toEqual(value);
  });
});

describe('websiteJsonLd', () => {
  it('AC4: describes the WebSite in Bulgarian', () => {
    expect(websiteJsonLd({ siteUrl: `${SITE}/`, name: 'Сезон', description: 'Описание' })).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Сезон',
      description: 'Описание',
      url: 'https://sezon.example/',
      inLanguage: 'bg',
    });
  });
});

describe('breadcrumbListJsonLd', () => {
  it('AC4: lists items with positions and absolute URLs', () => {
    expect(
      breadcrumbListJsonLd(
        [
          { name: 'Начало', path: '/' },
          { name: 'Ноември', path: '/sezon/noemvri' },
        ],
        SITE,
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Начало', item: 'https://sezon.example/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Ноември',
          item: 'https://sezon.example/sezon/noemvri',
        },
      ],
    });
  });

  it('AC4: rejects an empty list', () => {
    expect(() => breadcrumbListJsonLd([], SITE)).toThrow(InvalidPageMetaError);
  });
});
