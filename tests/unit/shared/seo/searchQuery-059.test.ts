import { describe, expect, it } from 'vitest';
import { matchesAllTerms, searchQuery } from '@shared/seo';

describe('searchQuery (spec 059)', () => {
  it('AC9: returns no words for an empty or blank query', () => {
    expect(searchQuery('')).toEqual([]);
    expect(searchQuery('   ')).toEqual([]);
  });

  it.each([
    ['витамин С', ['витамин', 'c']],
    ['Витамин В6', ['витамин', 'b6']],
    ['vitamin С', ['vitamin', 'c']],
    ['витамин к', ['витамин', 'k']],
    ['витамин C', ['витамин', 'c']],
  ])(
    'AC9: turns a Cyrillic look-alike letter after a vitamin word into Latin: %s',
    (raw, words) => {
      expect(searchQuery(raw)).toEqual(words);
    },
  );

  it('AC9: keeps a Cyrillic one-letter word that does not follow a vitamin word', () => {
    expect(searchQuery('ябълки с мед')).toEqual(['ябълк', 'с', 'мед']);
  });

  it.each([
    ['ябълки', 'ябълк'],
    ['ябълка', 'ябълк'],
    ['Ферма', 'ферм'],
    ['рецепта', 'рецепт'],
    ['доматите', 'домат'],
    ['лукът', 'лук'],
    ['круша', 'круш'],
    ['дюля', 'дюля'],
    ['гъби', 'гъби'],
    ['март', 'март'],
    ['праз', 'праз'],
    ['чай', 'чай'],
    ['yabalki', 'yabalki'],
    ['Praz', 'praz'],
  ])('AC9: stems the Cyrillic word %s to %s', (raw, stem) => {
    expect(searchQuery(raw)).toEqual([stem]);
  });

  it('AC9: splits on any white space', () => {
    expect(searchQuery('  ферма \t Пловдив ')).toEqual(['ферм', 'пловдив']);
  });
});

describe('matchesAllTerms (spec 059)', () => {
  it('AC9: is true when every term starts a word of the text', () => {
    expect(matchesAllTerms('Ябълки. Malus domestica', ['ябълк', 'malus'])).toBe(true);
    expect(matchesAllTerms('Витамин C в сезонните храни', ['витамин', 'c'])).toBe(true);
  });

  it('AC9: is false when a term only appears inside a word or not at all', () => {
    expect(matchesAllTerms('Белтъчини 1,06 г. Мазнини', ['гъб'])).toBe(false);
    expect(matchesAllTerms('Сезон по месеци', ['поверителност'])).toBe(false);
    expect(matchesAllTerms('Тиква, лук', ['меч', 'лук'])).toBe(false);
  });

  it('AC9: ignores diacritics and case like Pagefind does', () => {
    expect(matchesAllTerms('Калий в сезонните храни', ['калии'])).toBe(true);
    expect(matchesAllTerms('КАЛИЙ', ['калий'])).toBe(true);
  });

  it('AC9: is true for no terms', () => {
    expect(matchesAllTerms('Ябълки', [])).toBe(true);
  });
});
