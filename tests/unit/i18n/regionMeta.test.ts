import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { SITE_NAME, ui } from '@i18n/bg';

/** The suffix BaseLayout adds to every title. */
const SITE_SUFFIX = ` | ${SITE_NAME}`;

const DIR = join(process.cwd(), 'src', 'data', 'regions');
const NAMES = readdirSync(DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => (parse(readFileSync(join(DIR, file), 'utf8')) as { name: string }).name);
const length = (text: string) => [...text].length;

/** Produce and farm counts a region page can have (never both zero). */
const COUNTS: ReadonlyArray<readonly [number, number]> = [
  [12, 0],
  [1, 0],
  [0, 1],
  [0, 2],
  [3, 2],
  [1, 1],
];

describe('region page meta (spec 029)', () => {
  it.each(NAMES)('AC12: %s has a title ≤ 60 and a description of 70–160 characters', (name) => {
    expect(length(`${ui.regions.pageTitle(name)}${SITE_SUFFIX}`)).toBeLessThanOrEqual(60);
    for (const [produce, farms] of COUNTS) {
      const description = ui.regions.pageDescription(name, produce, farms);
      expect(length(description), `${produce}/${farms}`).toBeGreaterThanOrEqual(70);
      expect(length(description), `${produce}/${farms}`).toBeLessThanOrEqual(160);
    }
  });

  it('AC13: uses „във“ before в and ф and the full name of Sofia province', () => {
    expect(ui.regions.pageDescription('Варна', 0, 2)).toMatch(/^Във Варна /);
    expect(ui.regions.pageDescription('Враца', 0, 1)).toMatch(/^Във Враца /);
    expect(ui.regions.pageDescription('Пловдив', 12, 0)).toMatch(/^В Пловдив /);
    expect(ui.regions.pageTitle('Софийска')).toMatch(/^Софийска област: /);
    expect(ui.regions.pageDescription('Софийска', 0, 2)).toMatch(/^В Софийска област /);
    expect(ui.regions.mapCaptionFor('Софийска')).toContain('Софийска област');
  });

  it('AC14: describes only what the page shows', () => {
    expect(ui.regions.pageDescription('Пловдив', 12, 0)).not.toMatch(/ферм/);
    expect(ui.regions.pageDescription('Плевен', 0, 2)).not.toMatch(/отглежда/);
    for (const [produce, farms] of COUNTS) {
      expect(ui.regions.pageDescription('Пловдив', produce, farms)).not.toContain('по сезони');
    }
    expect(ui.regions.pageDescription('Пловдив', 1, 0)).toContain('1 продукт ');
    expect(ui.regions.pageDescription('Плевен', 0, 1)).toContain('1 местна ферма');
  });

  it('AC12: the overview title and description fit', () => {
    expect(length(ui.regions.title)).toBeLessThanOrEqual(60);
    expect(length(ui.regions.description)).toBeGreaterThanOrEqual(70);
    expect(length(ui.regions.description)).toBeLessThanOrEqual(160);
  });
});
