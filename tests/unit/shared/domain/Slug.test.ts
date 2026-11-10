import { describe, expect, it } from 'vitest';
import { Slug } from '@shared/domain/Slug';
import { InvalidSlugError } from '@shared/domain/errors';

describe('Slug', () => {
  it.each([
    ['Ябълки', 'yabalki'],
    ['Зеле', 'zele'],
    ['Кисели череши', 'kiseli-chereshi'],
    ['„Зелен лук“ (пресен)', 'zelen-luk-presen'],
    ['  Тиква  ', 'tikva'],
    ['Стара Загора', 'stara-zagora'],
    ['Витамин C', 'vitamin-c'],
    ['Омега-3 мастни киселини', 'omega-3-mastni-kiselini'],
    ['Добрич -- град', 'dobrich-grad'],
  ])('AC5: creates "%s" → "%s"', (input, expected) => {
    expect(Slug.fromBulgarian(input).value).toBe(expected);
  });

  it('AC5: accepts a valid slug via parse and exposes value, equals and toString', () => {
    const slug = Slug.parse('stara-zagora');
    expect(slug.value).toBe('stara-zagora');
    expect(String(slug)).toBe('stara-zagora');
    expect(slug.equals(Slug.fromBulgarian('Стара Загора'))).toBe(true);
    expect(slug.equals(Slug.parse('sofia'))).toBe(false);
  });

  it.each(['', '   ', '  —  ', '!!!'])(
    'AC6: rejects input "%s" that yields an empty slug',
    (input) => {
      expect(() => Slug.fromBulgarian(input)).toThrow(InvalidSlugError);
    },
  );

  it.each(['Sofia', 'stara zagora', '-sofia', 'sofia-', 'stara--zagora', 'зеле', '', 'a_b'])(
    'AC6: parse rejects "%s"',
    (input) => {
      expect(() => Slug.parse(input)).toThrow(InvalidSlugError);
    },
  );

  it('AC15: creates the same slug from decomposed input', () => {
    expect(Slug.fromBulgarian('Чай'.normalize('NFD')).value).toBe('chay');
  });

  it('AC17: is frozen', () => {
    expect(Object.isFrozen(Slug.parse('zele'))).toBe(true);
  });
});
