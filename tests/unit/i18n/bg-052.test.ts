import { describe, expect, it } from 'vitest';
import { produceSeasonTitle, produceTitle } from '@i18n/bg';

const TITLE_MAX_LENGTH = 60;
const SITE_SUFFIX = ' | Сезон';

describe('produce titles (spec 052, QA)', () => {
  it('AC12: a produce without nutrition gets a title without „хранителни стойности“', () => {
    expect(produceSeasonTitle('Мушмули')).toBe('Мушмули – сезон и ферми');
    expect(produceSeasonTitle('Мушмули')).not.toContain('хранителни');
  });

  it('AC12: a produce with nutrition keeps the title with „хранителни стойности“', () => {
    expect(produceTitle('Нар')).toBe('Нар – сезон, хранителни стойности и ферми');
  });

  it('AC12: the title without nutrition falls back to shorter variants within 60 characters', () => {
    const name = 'Б'.repeat(40);
    expect(produceSeasonTitle(name)).toBe(`${name} – сезон`);
    const longName = 'Б'.repeat(55);
    expect(produceSeasonTitle(longName)).toBe(longName);
    for (const title of [produceSeasonTitle('Мушмули'), produceSeasonTitle(name)]) {
      expect(`${title}${SITE_SUFFIX}`.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    }
  });
});
