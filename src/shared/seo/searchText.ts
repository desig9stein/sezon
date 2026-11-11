import { Slug } from '@shared/domain/Slug';

/**
 * Returns the Latin transliteration of a Bulgarian heading for the search index: lower case,
 * words separated by single spaces, e.g. „Витамин C“ → „vitamin c“.
 * @param text - Bulgarian heading.
 * @throws InvalidSlugError when the text has no letters or digits.
 */
export function latinSearchText(text: string): string {
  return Slug.fromBulgarian(text).value.split('-').join(' ');
}
