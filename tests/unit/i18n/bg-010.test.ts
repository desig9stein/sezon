import { describe, expect, it } from 'vitest';
import { PRODUCE_KINDS } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { ui, SITE_NAME } from '@i18n/bg';
import {
  characterCount,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from '@shared/seo';

const MONTHS = Array.from({ length: 12 }, (_, index) => Month.of(index + 1));

describe('section page texts', () => {
  it('AC5: names the four sections in Bulgarian', () => {
    expect(ui.sections.names).toEqual({
      fruit: 'Плодове',
      vegetable: 'Зеленчуци',
      herb: 'Подправки',
      nut: 'Ядки',
    });
  });

  for (const kind of PRODUCE_KINDS) {
    it(`AC5: the ${kind} title fits 60 characters with the site suffix`, () => {
      const title = `${ui.sections.title(kind)} | ${SITE_NAME}`;
      expect(characterCount(title)).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    });

    it(`AC5: the ${kind} description is 70–160 characters for every month`, () => {
      for (const month of MONTHS) {
        const length = characterCount(ui.sections.description(kind, month));
        expect(length).toBeGreaterThanOrEqual(DESCRIPTION_MIN_LENGTH);
        expect(length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
      }
    });
  }
});
