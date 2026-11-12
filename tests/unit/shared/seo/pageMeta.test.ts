import { describe, expect, it } from 'vitest';
import { buildPageMeta } from '@shared/seo/pageMeta';
import { InvalidPageMetaError } from '@shared/domain/errors';

const SITE = 'https://sezon.example';
const DESCRIPTION =
  'Виж кои плодове и зеленчуци са в сезон в България този месец и откъде да ги купиш.';

describe('buildPageMeta', () => {
  it('AC1: suffixes the title and builds canonical and OG fields', () => {
    const meta = buildPageMeta({
      title: 'Зеле',
      description: `  ${DESCRIPTION}  `,
      path: '/zelenchutsi/zele',
      siteUrl: SITE,
      siteName: 'Сезон',
      type: 'article',
    });
    expect(meta).toEqual({
      title: 'Зеле | Сезон',
      description: DESCRIPTION,
      canonicalUrl: 'https://sezon.example/zelenchutsi/zele',
      ogType: 'article',
      locale: 'bg_BG',
      siteName: 'Сезон',
    });
  });

  it('AC1: does not duplicate the site name and uses a slash for the root', () => {
    const meta = buildPageMeta({
      title: 'Сезон',
      description: DESCRIPTION,
      path: '/',
      siteUrl: `${SITE}/`,
      siteName: 'Сезон',
    });
    expect(meta.title).toBe('Сезон');
    expect(meta.canonicalUrl).toBe('https://sezon.example/');
    expect(meta.ogType).toBe('website');
  });

  it.each([
    ['a title over 60 characters', { title: 'а'.repeat(53) }],
    ['a description under 70 characters', { description: 'Кратко.' }],
    ['a description over 160 characters', { description: 'а'.repeat(161) }],
    ['a blank title', { title: '  ' }],
    ['a path without a leading slash', { path: 'sezon' }],
    ['a path with a trailing slash', { path: '/sezon/' }],
    ['a path with a query', { path: '/sezon?x=1' }],
    ['a path with a hash', { path: '/sezon#top' }],
  ])('AC2: rejects %s', (_label, overrides) => {
    expect(() =>
      buildPageMeta({
        title: 'Зеле',
        description: DESCRIPTION,
        path: '/zele',
        siteUrl: SITE,
        siteName: 'Сезон',
        ...overrides,
      }),
    ).toThrow(InvalidPageMetaError);
  });

  it('AC2: accepts a full title of exactly 60 characters', () => {
    const title = 'а'.repeat(60 - ' | Сезон'.length);
    expect(
      buildPageMeta({
        title,
        description: DESCRIPTION,
        path: '/',
        siteUrl: SITE,
        siteName: 'Сезон',
      }).title,
    ).toHaveLength(60);
  });
});
