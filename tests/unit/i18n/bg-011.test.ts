import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { SITE_NAME, ui } from '@i18n/bg';
import {
  characterCount,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from '@shared/seo';

const DATA_DIR = join(process.cwd(), 'src', 'data', 'nutrients');
const NAMES = readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => (parse(readFileSync(join(DATA_DIR, file), 'utf8')) as { name: string }).name);

describe('nutrient page texts', () => {
  for (const name of NAMES) {
    it(`AC6: the ${name} title fits and the description is 70–160 characters`, () => {
      expect(characterCount(`${ui.nutrients.title(name)} | ${SITE_NAME}`)).toBeLessThanOrEqual(
        TITLE_MAX_LENGTH,
      );
      const length = characterCount(ui.nutrients.description(name));
      expect(length).toBeGreaterThanOrEqual(DESCRIPTION_MIN_LENGTH);
      expect(length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
    });
  }

  it('AC6: falls back to shorter titles for long names', () => {
    expect(ui.nutrients.title('Витамин C')).toBe('Витамин C в сезонните храни от България');
    expect(ui.nutrients.title('Б'.repeat(30))).toBe(`${'Б'.repeat(30)} в сезонните храни`);
    expect(ui.nutrients.title('Б'.repeat(45))).toBe('Б'.repeat(45));
  });

  it('AC7: words claim labels as in the Annex of Regulation (EC) No 1924/2006', () => {
    expect(ui.nutrients.claimLabels.high('витамин C')).toBe('Високо съдържание на витамин C');
    expect(ui.nutrients.claimLabels.source('витамин C')).toBe('Източник на витамин C');
  });

  it('QA 011: states the importance of a varied diet (Regulation (EC) No 1924/2006, Art. 10(2))', () => {
    expect(ui.nutrients.balancedDiet).toBe(
      'Важно е храненето да е разнообразно и балансирано, както и да се води здравословен начин на живот.',
    );
    expect(ui.nutrients.quantityNote).toContain('100 г');
  });
});
