import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ui } from '@i18n/bg';

describe('optional growing regions in the docs (spec 042)', () => {
  it('AC4: the content guide allows an empty list only when no official source names a province', () => {
    expect(readFileSync('docs/CONTENT-GUIDE.md', 'utf8')).toContain(
      'only when no official source names a province',
    );
  });

  it('QA 042: the methodology no longer says every produce lists its provinces', () => {
    expect(ui.methodology.regions).not.toContain('За всеки продукт посочваме областите');
    expect(ui.methodology.regions).toContain('няма официални данни');
  });
});
