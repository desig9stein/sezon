import { describe, expect, it } from 'vitest';
import { latinSearchText } from '@shared/seo';

describe('latinSearchText', () => {
  it.each([
    ['Ябълки', 'yabalki'],
    ['Витамин C', 'vitamin c'],
    ['Зеленчуци', 'zelenchutsi'],
    ['Целина (коренова)', 'tselina korenova'],
  ])('AC1: transliterates „%s“ to „%s“', (text, latin) => {
    expect(latinSearchText(text)).toBe(latin);
  });
});
