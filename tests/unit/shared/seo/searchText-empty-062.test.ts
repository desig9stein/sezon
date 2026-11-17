import { describe, expect, it } from 'vitest';
import { matchesAllTerms, matchesHeading, matchesWordForms, wordsOf } from '@shared/seo/searchText';

describe('search text without words (spec 062)', () => {
  it('a text without words matches no term', () => {
    expect(wordsOf('— … —')).toEqual([]);
    expect(matchesAllTerms('— … —', ['ябълки'])).toBe(false);
    expect(matchesHeading('— … —', ['ферм'])).toBe(false);
    expect(matchesWordForms('— … —', ['нар'])).toBe(false);
  });
});
