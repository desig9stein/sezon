import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

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
const formalFormsInText = (text: string): string[] => [
  ...text.split(/[^\p{L}]+/u).filter(isFormalWord),
  ...FORMAL_PHRASES.flatMap((phrase) => text.match(phrase) ?? []),
];

const formalFormsIn = (path: string): string[] =>
  formalFormsInText(readFileSync(path, 'utf8')).map((word) => `${path}: ${word}`);

/** Keys of a source object that quote another site: its title and address. */
const SOURCE_KEYS: ReadonlySet<string> = new Set(['name', 'url']);

/**
 * Returns the strings of a parsed YAML value, skipping the `name` and `url` of source objects
 * (those with a `url`), which quote another site.
 */
const ownStrings = (value: unknown): string[] => {
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

const formalFormsInContent = (path: string): string[] =>
  ownStrings(parse(readFileSync(path, 'utf8')))
    .flatMap(formalFormsInText)
    .map((word) => `${path}: ${word}`);

describe('„ти“ voice (spec 028)', () => {
  it('AC1: UI strings use the informal form', () => {
    expect(formalFormsIn('src/i18n/bg.ts')).toEqual([]);
  });

  it('AC2: content uses the informal form', () => {
    const files = globSync('src/data/**/*.yaml');
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(formalFormsInContent)).toEqual([]);
  });

  it('AC3: the content guide states the voice rule with an example', () => {
    const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
    expect(guide).toMatch(/^#+ .*(Voice|voice)/m);
    expect(guide).toContain('„ти“');
    expect(guide).toMatch(/„Изберете[^“]*“\s*→\s*„Избери/);
  });
});

describe('„ти“ voice guard (spec 028 QA)', () => {
  it('AC5: catches every „Ваш…“ form, new imperatives and modal verbs', () => {
    for (const text of [
      'Вашите плодове',
      'Вашето място',
      'Вашият избор',
      'Можете да ги замразите',
      'Опитайте с лимон',
      'Поливайте редовно',
      'ако искате',
      'ако имате градина',
      'за да ги купите',
    ]) {
      expect(formalFormsInText(text), text).not.toEqual([]);
    }
  });

  it('AC5: does not flag plural nouns such as „купите“ (heaps)', () => {
    expect(formalFormsInText('Сложи купите компост до лехите.')).toEqual([]);
  });

  it('AC5: skips only the quoted name of a source, not other text beside a url', () => {
    expect(
      ownStrings({ name: 'Купете фиданки', url: 'https://example.bg', note: 'Изберете' }),
    ).toEqual(['Изберете']);
  });
});
