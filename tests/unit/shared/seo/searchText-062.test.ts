import { describe, expect, it } from 'vitest';
import { matchesWordForms } from '@shared/seo/searchText';

describe('matchesWordForms (spec 062)', () => {
  it('AC10: a short term matches the word itself and its inflected forms', () => {
    expect(matchesWordForms('Нар', ['нар'])).toBe(true);
    expect(matchesWordForms('Зърната на нара са сочни.', ['нар'])).toBe(true);
    expect(matchesWordForms('Лукът се пази на сухо.', ['лук'])).toBe(true);
    expect(matchesWordForms('Пресни нарове.', ['нар'])).toBe(true);
  });

  it('AC10: a short term does not match longer words that only start with it', () => {
    expect(matchesWordForms('Нарязани ябълки по народна рецепта.', ['нар'])).toBe(false);
  });

  it('AC10: longer terms keep prefix matching', () => {
    expect(matchesWordForms('Ябълките са в сезон.', ['ябълк'])).toBe(true);
    expect(matchesWordForms('Ябълките са в сезон.', ['круш'])).toBe(false);
  });

  it('AC10: Latin vitamin letters keep prefix matching', () => {
    expect(matchesWordForms('Витамин C в сезонните храни', ['витамин', 'c'])).toBe(true);
  });
});
