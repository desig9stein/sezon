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
/** A Cyrillic letter that looks or sounds like a Latin vitamin letter, optionally with digits („В6“). */
const VITAMIN_LETTER = /^([авсекц])(\d*)$/;
const LATIN_LOOK_ALIKES: Readonly<Record<string, string>> = {
  а: 'a',
  в: 'b',
  с: 'c',
  ц: 'c',
  е: 'e',
  к: 'k',
};
const CYRILLIC_ONLY = /^\p{Script=Cyrillic}+$/u;
/**
 * Plural and definite endings removed before the final vowel, with the minimum word length, longest
 * first („ябълката“ → „ябълка“, „гроздето“ → „грозде“, „доматите“ → „домат“). The short article
 * endings count only after a vowel, so „рецепта“ keeps its „та“.
 */
const ENDINGS: ReadonlyArray<{
  readonly ending: string;
  readonly minLength: number;
  readonly afterVowel?: boolean;
}> = [
  { ending: 'ите', minLength: 6 },
  { ending: 'ята', minLength: 6 },
  { ending: 'та', minLength: 6, afterVowel: true },
  { ending: 'то', minLength: 6, afterVowel: true },
  { ending: 'те', minLength: 6, afterVowel: true },
  { ending: 'ът', minLength: 5 },
  { ending: 'ят', minLength: 5 },
];
const FINAL_VOWEL = /[аяеиоуъю]$/;
const MIN_VOWEL_STEM_LENGTH = 5;
const COMBINING_MARKS = /\p{M}+/gu;
const WORD = /[\p{L}\p{N}]+/gu;

/**
 * Bulgarian words that carry no meaning for the search: question words, prepositions,
 * conjunctions, particles, pronouns and auxiliary verbs. They are dropped from the query unless
 * every word is one of them.
 */
const STOP_WORDS: ReadonlySet<string> = new Set([
  'а',
  'без',
  'в',
  'във',
  'да',
  'дали',
  'до',
  'е',
  'за',
  'и',
  'или',
  'има',
  'искам',
  'как',
  'какво',
  'каква',
  'какъв',
  'какви',
  'кога',
  'колко',
  'кой',
  'коя',
  'кое',
  'кои',
  'къде',
  'към',
  'ли',
  'ме',
  'ми',
  'може',
  'мога',
  'на',
  'над',
  'не',
  'но',
  'около',
  'от',
  'по',
  'под',
  'при',
  'през',
  'с',
  'са',
  'се',
  'си',
  'след',
  'със',
  'това',
  'този',
  'тази',
  'тези',
  'ще',
  'защо',
]);

/**
 * Verb forms of the garden jobs, mapped to the stem of the noun the site uses („кога се сее“ →
 * „Сеитба“, „засадя“ → „Засаждане“).
 */
const GARDEN_VERBS: ReadonlyArray<{
  readonly stem: string;
  readonly forms: ReadonlyArray<string>;
}> = [
  {
    stem: 'сеитб',
    forms: ['сея', 'сее', 'сееш', 'сеем', 'сеят', 'засея', 'засее', 'засеят', 'посея', 'посее'],
  },
  {
    stem: 'засажд',
    forms: [
      'садя',
      'сади',
      'садят',
      'засадя',
      'засади',
      'засадят',
      'засаждам',
      'засажда',
      'посадя',
      'посади',
    ],
  },
  { stem: 'разсажд', forms: ['разсадя', 'разсади', 'разсаждам', 'разсажда'] },
];
const GARDEN_STEMS: ReadonlyMap<string, string> = new Map(
  GARDEN_VERBS.flatMap((verb) => verb.forms.map((form) => [form, verb.stem] as const)),
);
/** Letters a list-page heading word may have after a query word and still count as that word. */
const MAX_HEADING_SUFFIX = 2;

/**
 * Light stemming of one lower-case Cyrillic word: drops a plural or definite ending, then a final
 * vowel, so that a prefix search finds the singular and the plural („ябълка“ → „ябълк“).
 */
function stem(word: string): string {
  if (!CYRILLIC_ONLY.test(word)) return word;
  const ending = ENDINGS.find(
    (entry) =>
      word.length >= entry.minLength &&
      word.endsWith(entry.ending) &&
      (entry.afterVowel !== true || FINAL_VOWEL.test(word.slice(0, -entry.ending.length))),
  );
  const base = ending === undefined ? word : word.slice(0, -ending.ending.length);
  return base.length >= MIN_VOWEL_STEM_LENGTH && FINAL_VOWEL.test(base) ? base.slice(0, -1) : base;
}

/** A query word and whether it is a vitamin letter, which is never a stop word. */
interface QueryWord {
  readonly word: string;
  readonly vitaminLetter: boolean;
}

/**
 * Normalises a search query for the Pagefind index, which has no Bulgarian stemming: lower case,
 * split into words of letters and digits (punctuation and hyphens separate words), a Cyrillic
 * letter after a vitamin word turned into its Latin letter („витамин С“ → „витамин c“), stop words
 * dropped (unless every word is one), garden verbs mapped to the site's nouns and Cyrillic words
 * lightly stemmed.
 * @param raw - The query as typed.
 * @returns The normalised words, empty for a blank query.
 */
export function searchQuery(raw: string): ReadonlyArray<string> {
  const words = raw.toLowerCase().match(WORD) ?? [];
  const marked: ReadonlyArray<QueryWord> = words.map((word, index) => {
    const previous = words[index - 1];
    const letter = VITAMIN_LETTER.exec(word);
    if (previous !== undefined && VITAMIN_WORD.test(previous) && letter !== null) {
      return {
        word: `${LATIN_LOOK_ALIKES[letter[1] ?? ''] ?? ''}${letter[2] ?? ''}`,
        vitaminLetter: true,
      };
    }
    return { word, vitaminLetter: false };
  });
  const meaningful = marked.filter((entry) => entry.vitaminLetter || !STOP_WORDS.has(entry.word));
  return (meaningful.length === 0 ? marked : meaningful).map((entry) =>
    entry.vitaminLetter ? entry.word : (GARDEN_STEMS.get(entry.word) ?? stem(entry.word)),
  );
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

/**
 * Returns whether every term names a word of a list-page heading: the word starts with the term
 * and is at most two letters longer („ферм“ → „ферми“, but not „зеле“ → „зеленчуци“).
 * @param heading - Heading of a list page.
 * @param terms - Normalised query words from {@link searchQuery}.
 */
export function matchesHeading(heading: string, terms: ReadonlyArray<string>): boolean {
  const words = folded(heading).match(WORD) ?? [];
  return terms.every((term) => {
    const wanted = folded(term);
    return words.some(
      (word) => word.startsWith(wanted) && word.length - wanted.length <= MAX_HEADING_SUFFIX,
    );
  });
}

/**
 * Returns the words of `text` the way the search compares them: lower case, without diacritics,
 * letters and digits only.
 * @param text - Any text, e.g. a result title.
 */
export function wordsOf(text: string): ReadonlyArray<string> {
  return folded(text).match(WORD) ?? [];
}

/** Longest query word that must match a whole word or one of its forms, not any longer word. */
export const SHORT_TERM_MAX_LENGTH = 3;
/**
 * Bulgarian endings a short query word may carry and still name the same thing: plural, definite
 * and count forms („нар“ → „нара“, „нарът“, „нарове“; „лук“ → „лукът“).
 */
const INFLECTION_ENDINGS: ReadonlySet<string> = new Set([
  'а',
  'я',
  'е',
  'и',
  'ът',
  'ят',
  'та',
  'то',
  'те',
  'ите',
  'ове',
  'овете',
  'ева',
  'ета',
]);
const CYRILLIC_TERM = /^\p{Script=Cyrillic}+$/u;

/**
 * Returns whether `term` is a short Cyrillic query word that must match a whole word or one of its
 * forms (spec 062). Latin words such as the vitamin letter „c“ keep prefix matching.
 */
export function isShortTerm(term: string): boolean {
  return term.length <= SHORT_TERM_MAX_LENGTH && CYRILLIC_TERM.test(term);
}

/**
 * Returns whether every term names a word of `text`: a short Cyrillic term (see
 * {@link isShortTerm}) the word itself or the word plus a Bulgarian ending („нар“ matches „нара“,
 * not „нарязани“), any other term the start of a word.
 * @param text - Page text (content, title and aliases of a search result).
 * @param terms - Normalised query words from {@link searchQuery}.
 */
export function matchesWordForms(text: string, terms: ReadonlyArray<string>): boolean {
  const words = folded(text).match(WORD) ?? [];
  return terms.every((term) => {
    const wanted = folded(term);
    if (!isShortTerm(term)) return words.some((word) => word.startsWith(wanted));
    return words.some(
      (word) =>
        word === wanted ||
        (word.startsWith(wanted) && INFLECTION_ENDINGS.has(word.slice(wanted.length))),
    );
  });
}

/** The normalised query word for „семейство“ (family): it asks for a family page (spec 062). */
export const FAMILY_TERM = 'семейств';
