import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

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

const formalFormsIn = (path: string): string[] =>
  readFileSync(path, 'utf8')
    .split(/[^\p{L}]+/u)
    .filter((word) => FORMAL_FORMS.has(word.toLowerCase()))
    .map((word) => `${path}: ${word}`);

describe('„ти“ voice (spec 028)', () => {
  it('AC1: UI strings use the informal form', () => {
    expect(formalFormsIn('src/i18n/bg.ts')).toEqual([]);
  });

  it('AC2: content uses the informal form', () => {
    const files = globSync('src/data/**/*.yaml');
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(formalFormsIn)).toEqual([]);
  });

  it('AC3: the content guide states the voice rule with an example', () => {
    const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
    expect(guide).toMatch(/^#+ .*(Voice|voice)/m);
    expect(guide).toContain('„ти“');
    expect(guide).toMatch(/„Изберете[^“]*“\s*→\s*„Избери/);
  });
});
