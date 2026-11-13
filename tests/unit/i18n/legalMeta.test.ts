import { describe, expect, it } from 'vitest';
import { SITE_NAME, ui } from '@i18n/bg';

const SUFFIX = ` | ${SITE_NAME}`;
const length = (text: string) => [...text].length;

describe('advertising, privacy and cookies meta (spec 046)', () => {
  it.each([
    ['advertising', ui.advertising.title, ui.advertising.description],
    ['privacy', ui.privacy.title, ui.privacy.description],
    ['cookies', ui.cookies.title, ui.cookies.description],
  ])(
    'AC2: %s has a title ≤ 60 with the suffix and a description of 70–160',
    (_, title, description) => {
      expect(length(`${title}${SUFFIX}`)).toBeLessThanOrEqual(60);
      expect(length(description)).toBeGreaterThanOrEqual(70);
      expect(length(description)).toBeLessThanOrEqual(160);
    },
  );

  it('AC2: the three pages have distinct titles and descriptions', () => {
    const pages = [ui.advertising, ui.privacy, ui.cookies];
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length);
  });
});
