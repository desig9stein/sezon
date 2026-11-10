const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
};

/** Words with a statutory transliteration that differs from the letter table. */
const STATUTORY_EXCEPTIONS: Readonly<Record<string, string>> = {
  българия: 'bulgaria',
};

const CYRILLIC_WORD = /\p{Script=Cyrillic}+/gu;
const WORD_CHARACTER = /[\p{L}\p{N}]/u;
const WORD_FINAL_IA = 'ия';
const WORD_FINAL_IA_LATIN = 'ia';

type LetterCase = 'lower' | 'capitalised' | 'upper';

/**
 * Transliterates Bulgarian Cyrillic text to Latin using the Streamlined System of the
 * Bulgarian Transliteration Act (2009): the letter table, the word-final "ия" → "ia" rule
 * and the statutory exception "България" → "Bulgaria".
 * Characters that are not Cyrillic letters are returned unchanged.
 * @param text - Text to transliterate.
 * @returns The transliterated text.
 */
export function transliterate(text: string): string {
  return text.replace(CYRILLIC_WORD, (run: string, offset: number) => {
    const next = text.charAt(offset + run.length);
    const endsWord = next === '' || !WORD_CHARACTER.test(next);
    return transliterateRun(run, endsWord);
  });
}

function transliterateRun(run: string, endsWord: boolean): string {
  const letterCase = detectCase(run);
  const lower = run.toLowerCase();
  const exception = endsWord ? STATUTORY_EXCEPTIONS[lower] : undefined;
  if (exception !== undefined) {
    return applyCase(exception, letterCase);
  }

  const hasFinalIa = endsWord && lower.endsWith(WORD_FINAL_IA);
  const body = hasFinalIa ? run.slice(0, -WORD_FINAL_IA.length) : run;
  const latinBody = Array.from(body, (char) => transliterateLetter(char, letterCase)).join('');
  if (!hasFinalIa) {
    return latinBody;
  }
  const finalIa = run.slice(-WORD_FINAL_IA.length);
  const finalCase: LetterCase =
    body === '' ? detectCase(finalIa) : letterCase === 'upper' ? 'upper' : 'lower';
  return latinBody + applyCase(WORD_FINAL_IA_LATIN, finalCase);
}

function transliterateLetter(char: string, wordCase: LetterCase): string {
  const lower = char.toLowerCase();
  const latin = CYRILLIC_TO_LATIN[lower];
  if (latin === undefined) {
    return char;
  }
  if (char === lower) {
    return latin;
  }
  return applyCase(latin, wordCase === 'upper' ? 'upper' : 'capitalised');
}

function detectCase(word: string): LetterCase {
  if (word.length > 1 && word === word.toUpperCase() && word !== word.toLowerCase()) {
    return 'upper';
  }
  const first = word.charAt(0);
  return first !== first.toLowerCase() ? 'capitalised' : 'lower';
}

function applyCase(latin: string, letterCase: LetterCase): string {
  switch (letterCase) {
    case 'upper':
      return latin.toUpperCase();
    case 'capitalised':
      return latin.charAt(0).toUpperCase() + latin.slice(1);
    case 'lower':
      return latin;
  }
}
