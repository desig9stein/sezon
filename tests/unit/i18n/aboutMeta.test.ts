import { describe, expect, it } from 'vitest';
import { SITE_NAME, ui } from '@i18n/bg';

const SUFFIX = ` | ${SITE_NAME}`;
const length = (text: string) => [...text].length;

describe('about and methodology meta (spec 031)', () => {
  it.each([
    ['about', ui.about.title, ui.about.description],
    ['methodology', ui.methodology.title, ui.methodology.description],
  ])(
    'AC9: %s has a title ≤ 60 with the suffix and a description of 70–160',
    (_, title, description) => {
      expect(length(`${title}${SUFFIX}`)).toBeLessThanOrEqual(60);
      expect(length(description)).toBeGreaterThanOrEqual(70);
      expect(length(description)).toBeLessThanOrEqual(160);
    },
  );
});
