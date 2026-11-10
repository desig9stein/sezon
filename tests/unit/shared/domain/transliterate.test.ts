import { describe, expect, it } from 'vitest';
import { transliterate } from '@shared/domain/transliterate';

describe('transliterate', () => {
  it.each([
    ['а', 'a'],
    ['б', 'b'],
    ['в', 'v'],
    ['г', 'g'],
    ['д', 'd'],
    ['е', 'e'],
    ['ж', 'zh'],
    ['з', 'z'],
    ['и', 'i'],
    ['й', 'y'],
    ['к', 'k'],
    ['л', 'l'],
    ['м', 'm'],
    ['н', 'n'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['у', 'u'],
    ['ф', 'f'],
    ['х', 'h'],
    ['ц', 'ts'],
    ['ч', 'ch'],
    ['ш', 'sh'],
    ['щ', 'sht'],
    ['ъ', 'a'],
    ['ь', 'y'],
    ['ю', 'yu'],
    ['я', 'ya'],
  ])('AC1: transliterates %s as %s', (cyrillic, latin) => {
    expect(transliterate(cyrillic)).toBe(latin);
  });

  it('AC1: transliterates whole words', () => {
    expect(transliterate('ябълки')).toBe('yabalki');
    expect(transliterate('зеле')).toBe('zele');
    expect(transliterate('целина')).toBe('tselina');
    expect(transliterate('праз')).toBe('praz');
    expect(transliterate('шипка')).toBe('shipka');
  });

  it('AC2: renders word-final "ия" as "ia"', () => {
    expect(transliterate('България')).toBe('Bulgaria');
    expect(transliterate('София')).toBe('Sofia');
    expect(transliterate('градина и ливадия край')).toBe('gradina i livadia kray');
  });

  it('AC2: renders "ия" inside a word as "iya"', () => {
    expect(transliterate('Мариянка')).toBe('Mariyanka');
    expect(transliterate('пиян')).toBe('piyan');
  });

  it('AC2: treats "ия" before punctuation as word-final', () => {
    expect(transliterate('България, София.')).toBe('Bulgaria, Sofia.');
  });

  it('AC3: capitalises the first Latin letter of a capitalised Cyrillic letter', () => {
    expect(transliterate('Щит')).toBe('Shtit');
    expect(transliterate('Жълт')).toBe('Zhalt');
    expect(transliterate('Юли')).toBe('Yuli');
  });

  it('AC3: keeps fully uppercase words fully uppercase', () => {
    expect(transliterate('ЩИТ')).toBe('SHTIT');
    expect(transliterate('БЪЛГАРИЯ')).toBe('BULGARIA');
  });

  it('AC4: leaves non-Cyrillic characters unchanged', () => {
    expect(transliterate('Vitamin C 100 g!')).toBe('Vitamin C 100 g!');
    expect(transliterate('')).toBe('');
    expect(transliterate('„Зелен лук“ (пресен)')).toBe('„Zelen luk“ (presen)');
  });
});
