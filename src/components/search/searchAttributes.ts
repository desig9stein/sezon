import { latinSearchText } from '@shared/seo';

/**
 * Returns the attributes that let the search index match a page heading in Latin letters: the
 * transliterated name, indexed by Pagefind and kept as `latin` metadata so result excerpts can
 * drop it again.
 * @param name - Bulgarian name of the produce, section or nutrient.
 */
export function searchHeadingAttributes(name: string): Readonly<Record<string, string>> {
  return {
    'data-search-latin': latinSearchText(name),
    'data-pagefind-index-attrs': 'data-search-latin',
    'data-pagefind-meta': 'latin[data-search-latin]',
  };
}
