/** Languages a source title can be written in; the first is the site language. */
export const SOURCE_LANGUAGES = ['bg', 'en', 'de', 'fr', 'la'] as const;

/** Language of a source title, as a BCP 47 code. */
export type SourceLanguage = (typeof SOURCE_LANGUAGES)[number];

/** Language of a source title that does not declare one: the site language. */
export const DEFAULT_SOURCE_LANGUAGE: SourceLanguage = 'bg';

/**
 * Returns the language to mark on a source title: its language when that is not the site
 * language, otherwise `undefined` (the title needs no `lang` attribute).
 * @param lang - Declared language of the title, if any.
 */
export function foreignLanguage(lang: SourceLanguage | undefined): SourceLanguage | undefined {
  return lang === DEFAULT_SOURCE_LANGUAGE ? undefined : lang;
}
