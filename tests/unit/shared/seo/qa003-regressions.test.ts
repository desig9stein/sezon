import { describe, expect, it } from 'vitest';
import { absoluteUrl, buildPageMeta } from '@shared/seo/pageMeta';
import { InvalidPageMetaError } from '@shared/domain/errors';

const SITE = 'https://sezon.example';
const DESCRIPTION =
  'Виж кои плодове и зеленчуци са в сезон в България този месец и откъде да ги купиш.';
const base = {
  title: 'Зеле',
  description: DESCRIPTION,
  path: '/zele',
  siteUrl: SITE,
  siteName: 'Сезон',
};

describe('QA 003 regressions: page meta', () => {
  it('uses the given site name', () => {
    expect(buildPageMeta({ ...base, siteName: 'Друго' }).title).toBe('Зеле | Друго');
  });

  it('collapses inner whitespace before validating', () => {
    const meta = buildPageMeta({
      ...base,
      title: 'Зеле\n  и  лук',
      description: `${DESCRIPTION}\n\n   `,
    });
    expect(meta.title).toBe('Зеле и лук | Сезон');
    expect(meta.description).toBe(DESCRIPTION);
    expect(() =>
      buildPageMeta({ ...base, description: `${'а'.repeat(30)}${' '.repeat(45)}край` }),
    ).toThrow(InvalidPageMetaError);
  });

  it('does not duplicate a suffix that is already present', () => {
    expect(buildPageMeta({ ...base, title: 'Зеле | Сезон' }).title).toBe('Зеле | Сезон');
  });

  it('counts characters, not UTF-16 code units', () => {
    const title = `${'а'.repeat(48)}🥬🥬🥬🥬`;
    expect(buildPageMeta({ ...base, title }).title).toBe(`${title} | Сезон`);
  });

  it.each([
    'https://sezon.example/?x=1',
    'https://sezon.example/#top',
    'https://example.org/sezon/',
    'not a url',
  ])('rejects site URL %s', (siteUrl) => {
    expect(() => buildPageMeta({ ...base, siteUrl })).toThrow(InvalidPageMetaError);
  });

  it('joins site and path with the URL API', () => {
    expect(absoluteUrl('https://sezon.example/', '/zele')).toBe('https://sezon.example/zele');
    expect(absoluteUrl('https://sezon.example', '/')).toBe('https://sezon.example/');
  });
});
