import { describe, expect, it } from 'vitest';
import { containsWordForms, isWordForm } from '@shared/domain/wordForms';

describe('word forms (spec 062)', () => {
  it('a word is a form of itself', () => {
    expect(isWordForm('чушки', 'чушки')).toBe(true);
  });

  it('accepts another form of the same stem, with or without an ending', () => {
    expect(isWordForm('ябълки', 'ябълка')).toBe(true);
    expect(isWordForm('нар', 'нара')).toBe(true);
  });

  it('rejects a fragment and a name that is only an ending', () => {
    expect(isWordForm('ябълки', 'ябъл')).toBe(false);
    expect(isWordForm('а', 'а')).toBe(true);
    expect(isWordForm('и', 'а')).toBe(false);
  });

  it('finds every word of a name in a text as a whole word or a form of it', () => {
    expect(containsWordForms('Чушките се берат през лятото.', 'чушки')).toBe(true);
    expect(containsWordForms('Чушките се берат.', 'чушк')).toBe(false);
  });

  it('finds nothing in a text without words', () => {
    expect(containsWordForms('— … —', 'чушки')).toBe(false);
    expect(containsWordForms('', '')).toBe(true);
  });
});
