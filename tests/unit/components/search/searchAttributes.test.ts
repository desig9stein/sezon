import { describe, expect, it } from 'vitest';
import { searchHeadingAttributes } from '@components/search/searchAttributes';

describe('searchHeadingAttributes', () => {
  it('AC4: indexes the Latin name and keeps it as latin metadata', () => {
    expect(searchHeadingAttributes('Ябълки')).toEqual({
      'data-search-latin': 'yabalki',
      'data-pagefind-index-attrs': 'data-search-latin',
      'data-pagefind-meta': 'latin[data-search-latin]',
    });
  });
});
