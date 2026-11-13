/** Formal („Вие“) words that must not appear in reader-facing text, lower case. */
const FORMAL_WORDS: ReadonlySet<string> = new Set([
  'вие',
  'ви',
  'вас',
  'можете',
  'искате',
  'имате',
  'изберете',
  'купете',
  'пазете',
  'варете',
  'печете',
  'махнете',
  'обелете',
  'поставете',
  'спасете',
  'задушете',
  'добавете',
  'разрежете',
  'изплакнете',
  'берете',
  'отрежете',
  'сложете',
  'натиснете',
  'белете',
  'търсете',
  'търсите',
  'приготвите',
  'продължите',
  'свалите',
  'направите',
  'подготвите',
  'решите',
  'губите',
  'нарежете',
  'сварете',
  'оставете',
  'затворете',
  'напълнете',
  'изсипете',
  'разтворете',
  'свалете',
  'наредете',
  'прецедете',
]);
/** Possessive „Ваш…“ in every form. */
const FORMAL_POSSESSIVE = /^ваш/u;
/** Plural imperatives such as „опитайте“, „поливайте“, „вижте“, „яжте“. */
const FORMAL_IMPERATIVE = /(йте|жте)$/u;
/** „купите“ is formal only as a verb („да (ги) купите“); alone it is also „heaps“. */
const FORMAL_PHRASES: ReadonlyArray<RegExp> = [/(?<!\p{L})да (?:ги |го |я )?купите(?!\p{L})/giu];

const isFormalWord = (word: string): boolean => {
  const lower = word.toLowerCase();
  return FORMAL_WORDS.has(lower) || FORMAL_POSSESSIVE.test(lower) || FORMAL_IMPERATIVE.test(lower);
};

/** Returns the formal words and phrases in `text`. */
export const formalFormsInText = (text: string): string[] => [
  ...text.split(/[^\p{L}]+/u).filter(isFormalWord),
  ...FORMAL_PHRASES.flatMap((phrase) => text.match(phrase) ?? []),
];

/** Keys of a source object that quote another site: its title and address. */
const SOURCE_KEYS: ReadonlySet<string> = new Set(['name', 'url']);

/**
 * Returns the strings of a parsed YAML value, skipping the `name` and `url` of source objects
 * (those with a `url`), which quote another site.
 */
export const ownStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(ownStrings);
  if (value !== null && typeof value === 'object') {
    const isSource = 'url' in value;
    return Object.entries(value)
      .filter(([key]) => !(isSource && SOURCE_KEYS.has(key)))
      .flatMap(([, entry]) => ownStrings(entry));
  }
  return [];
};
