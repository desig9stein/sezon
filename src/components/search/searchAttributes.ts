import { latinSearchText } from '@shared/seo';

/**
 * Returns the attributes that let the search index match a page heading in Latin letters: the
 * transliterated name, indexed by Pagefind and kept as `latin` metadata so result excerpts can
 * drop it again. An `alias`, the name the page goes by in links (e.g. „За нас“ for „За Сезон“),
 * is indexed too (spec 059).
 * @param name - Bulgarian name of the page's subject or heading.
 * @param alias - Other name of the page, when its links use one.
 */
export function searchHeadingAttributes(
  name: string,
  alias?: string,
): Readonly<Record<string, string>> {
  const latin = {
    'data-search-latin': latinSearchText(name),
    'data-pagefind-meta': 'latin[data-search-latin]',
  };
  return alias === undefined
    ? { ...latin, 'data-pagefind-index-attrs': 'data-search-latin' }
    : {
        ...latin,
        'data-pagefind-meta': 'latin[data-search-latin], alias[data-search-alias]',
        'data-search-alias': alias,
        'data-pagefind-index-attrs': 'data-search-latin,data-search-alias',
      };
}

/**
 * Returns the attributes that put an element's content into the search index with a result type
 * label (spec 059), stored as Pagefind `type` metadata (shown above the result title) and as a
 * `type` filter (the search looks up list pages with it).
 * @param type - Bulgarian label of the page type, e.g. „Ферма“.
 */
export function searchBodyAttributes(type: string): Readonly<Record<string, string>> {
  return {
    'data-pagefind-body': '',
    'data-pagefind-meta': `type:${type}`,
    'data-pagefind-filter': `type:${type}`,
  };
}

/** Pagefind weight of a list page's heading, the highest Pagefind allows (spec 059). */
const HUB_HEADING_WEIGHT = '10';

/**
 * Returns the heading attributes of a list page (a section, the catalogue, the farms, regions or
 * recipes): the Latin attributes plus the highest search weight, so that „ферма“ lists the farm
 * list before single farms whose names contain the word.
 * @param name - Bulgarian heading of the list page.
 */
export function searchHubHeadingAttributes(name: string): Readonly<Record<string, string>> {
  return { ...searchHeadingAttributes(name), 'data-pagefind-weight': HUB_HEADING_WEIGHT };
}
