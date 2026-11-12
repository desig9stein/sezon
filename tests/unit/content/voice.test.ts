import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

/** Formal („Вие“) forms that addressed the reader before the switch to „ти“, lower case. */
const FORMAL_FORMS: ReadonlySet<string> = new Set([
  'вие',
  'ви',
  'вас',
  'ваш',
  'ваша',
  'ваше',
  'ваши',
  'вашия',
  'вашата',
  'вижте',
  'разгледайте',
  'засейте',
  'дръжте',
  'консултирайте',
  'консумирайте',
  'добавяйте',
  'увийте',
  'пасирайте',
  'нарязвайте',
  'яжте',
  'измийте',
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
  'купите',
  'приготвите',
  'продължите',
  'свалите',
  'направите',
  'подготвите',
  'решите',
  'губите',
]);

const formalFormsInText = (text: string): string[] =>
  text.split(/[^\p{L}]+/u).filter((word) => FORMAL_FORMS.has(word.toLowerCase()));

const formalFormsIn = (path: string): string[] =>
  formalFormsInText(readFileSync(path, 'utf8')).map((word) => `${path}: ${word}`);

/**
 * Returns the strings of a parsed YAML value, skipping source objects (those with a `url`), whose
 * names quote other sites' titles.
 */
const ownStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(ownStrings);
  if (value !== null && typeof value === 'object') {
    if ('url' in value) return [];
    return Object.values(value).flatMap(ownStrings);
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
