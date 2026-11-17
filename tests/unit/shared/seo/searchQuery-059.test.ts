import { describe, expect, it } from 'vitest';
import { matchesAllTerms, matchesHeading, searchQuery } from '@shared/seo';

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

describe('searchQuery, QA 059', () => {
  it.each([
    ['ябълки!', ['ябълк']],
    ['ябълки, круши', ['ябълк', 'круш']],
    ['"ябълки"', ['ябълк']],
    ['София-град', ['софи', 'град']],
    ['Био-ферма', ['био', 'ферм']],
  ])('QA 059: splits %s on punctuation and hyphens', (raw, words) => {
    expect(searchQuery(raw)).toEqual(words);
  });

  it.each([
    ['ягодата', 'ягод'],
    ['крушата', 'круш'],
    ['ябълката', 'ябълк'],
    ['дюлята', 'дюл'],
    ['гроздето', 'грозд'],
    ['зелето', 'зеле'],
    ['кивито', 'киви'],
  ])('QA 059: strips the definite form of %s', (raw, stem) => {
    expect(searchQuery(raw)).toEqual([stem]);
  });

  it('QA 059: drops Bulgarian stop words', () => {
    expect(searchQuery('кога се сее пипер')).toEqual(['сеитб', 'пипер']);
    expect(searchQuery('какво да засадя през март')).toEqual(['засажд', 'март']);
    expect(searchQuery('за нас')).toEqual(['нас']);
  });

  it('QA 059: keeps the words when every word is a stop word', () => {
    expect(searchQuery('как е')).toEqual(['как', 'е']);
  });

  it('QA 059: keeps the vitamin letter even though „с“ is a stop word', () => {
    expect(searchQuery('витамин С')).toEqual(['витамин', 'c']);
  });

  it('QA 059: maps „витамин Ц“ to C', () => {
    expect(searchQuery('витамин Ц')).toEqual(['витамин', 'c']);
  });

  it('QA 059: known false positive, „сладко“ also matches „сладки картофи“', () => {
    expect(searchQuery('сладко')).toEqual(['сладк']);
    expect(matchesAllTerms('Сладки картофи', searchQuery('сладко'))).toBe(true);
  });
});

describe('matchesHeading, QA 059', () => {
  it('QA 059: matches a whole heading word or one at most two letters longer', () => {
    expect(matchesHeading('Местни ферми', ['ферм'])).toBe(true);
    expect(matchesHeading('Рецепти за зимнина', ['рецепт'])).toBe(true);
    expect(matchesHeading('Зеленчуци', ['зеле'])).toBe(false);
    expect(matchesHeading('Плодове', ['плод'])).toBe(false);
    expect(matchesHeading('Плодове', ['плодов'])).toBe(true);
  });
});
