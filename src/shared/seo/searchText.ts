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

/** Words that name a vitamin; the letter after them is the vitamin's Latin letter. */
const VITAMIN_WORD = /^(витамин|vitamin)/;
/** A Cyrillic letter that looks like a Latin vitamin letter, optionally with digits („В6“). */
const VITAMIN_LETTER = /^([авсек])(\d*)$/;
const LATIN_LOOK_ALIKES: Readonly<Record<string, string>> = {
  а: 'a',
  в: 'b',
  с: 'c',
  е: 'e',
  к: 'k',
};
const CYRILLIC_ONLY = /^\p{Script=Cyrillic}+$/u;
/** Plural and definite endings removed before the final vowel, with the minimum word length. */
const ENDINGS: ReadonlyArray<{ readonly ending: string; readonly minLength: number }> = [
  { ending: 'ите', minLength: 6 },
  { ending: 'ът', minLength: 5 },
  { ending: 'ят', minLength: 5 },
];
const FINAL_VOWEL = /[аяеиоуъю]$/;
const MIN_VOWEL_STEM_LENGTH = 5;
const COMBINING_MARKS = /\p{M}+/gu;
const WORD = /[\p{L}\p{N}]+/gu;

/**
 * Light stemming of one lower-case Cyrillic word: drops a plural or definite ending, then a final
 * vowel, so that a prefix search finds the singular and the plural („ябълка“ → „ябълк“).
 */
function stem(word: string): string {
  if (!CYRILLIC_ONLY.test(word)) return word;
  const ending = ENDINGS.find(
    (entry) => word.length >= entry.minLength && word.endsWith(entry.ending),
  );
  const base = ending === undefined ? word : word.slice(0, -ending.ending.length);
  return base.length >= MIN_VOWEL_STEM_LENGTH && FINAL_VOWEL.test(base) ? base.slice(0, -1) : base;
}

/**
 * Normalises a search query for the Pagefind index, which has no Bulgarian stemming: lower case,
 * split on white space, a Cyrillic look-alike letter after a vitamin word turned into its Latin
 * letter („витамин С“ → „витамин c“), and Cyrillic words lightly stemmed.
 * @param raw - The query as typed.
 * @returns The normalised words, empty for a blank query.
 */
export function searchQuery(raw: string): ReadonlyArray<string> {
  const words = raw
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  return words.map((word, index) => {
    const previous = words[index - 1];
    const letter = VITAMIN_LETTER.exec(word);
    if (previous !== undefined && VITAMIN_WORD.test(previous) && letter !== null) {
      return `${LATIN_LOOK_ALIKES[letter[1] ?? ''] ?? ''}${letter[2] ?? ''}`;
    }
    return stem(word);
  });
}

/** Lower case without diacritics, the way Pagefind compares words by default. */
function folded(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '');
}

/**
 * Returns whether every term starts a word of `text`, ignoring case and diacritics.
 * @param text - Page text (content, title and labels of a search result).
 * @param terms - Normalised query words from {@link searchQuery}.
 */
export function matchesAllTerms(text: string, terms: ReadonlyArray<string>): boolean {
  const words = folded(text).match(WORD) ?? [];
  return terms.every((term) => {
    const wanted = folded(term);
    return words.some((word) => word.startsWith(wanted));
  });
}
