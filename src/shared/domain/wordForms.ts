/**
 * Bulgarian endings that turn one form of a noun into another: plural, definite and count forms
 * („нар“ → „нара“, „нарът“, „нарове“; „ябълка“ → „ябълки“, „ябълките“).
 */
export const INFLECTION_ENDINGS: ReadonlySet<string> = new Set([
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

const WORD = /[\p{L}\p{N}]+/gu;

/** Returns the lower-case words of `text`: runs of letters and digits. */
function wordsIn(text: string): ReadonlyArray<string> {
  return text.toLowerCase().match(WORD) ?? [];
}

/**
 * Returns whether `word` is `name` itself or another form of the same word: both are one stem plus
 * an ending from {@link INFLECTION_ENDINGS}, and `name` carries an ending of its own unless it is
 * `word` („ябълка“ is a form of „ябълки“; the fragment „ябъл“ and the bare stem „чушк“ are not).
 * @param word - A lower-case word of a text.
 * @param name - A lower-case word of a name.
 */
export function isWordForm(word: string, name: string): boolean {
  if (word === name) return true;
  return [...INFLECTION_ENDINGS].some((nameEnding) => {
    if (!name.endsWith(nameEnding)) return false;
    const stem = name.slice(0, -nameEnding.length);
    const wordEnding = word.slice(stem.length);
    return (
      stem.length > 0 &&
      word.startsWith(stem) &&
      (wordEnding === '' || INFLECTION_ENDINGS.has(wordEnding))
    );
  });
}

/**
 * Returns whether every word of `name` occurs in `text` as a whole word or another form of it
 * (see {@link isWordForm}), ignoring case.
 * @param text - Text to look in, e.g. the text of a produce.
 * @param name - One or more words, e.g. an alias.
 */
export function containsWordForms(text: string, name: string): boolean {
  const words = wordsIn(text);
  return wordsIn(name).every((part) => words.some((word) => isWordForm(word, part)));
}
