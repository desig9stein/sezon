import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ui } from '@i18n/bg';

const DIR = join(process.cwd(), 'src', 'data', 'regions');
const NAMES = readdirSync(DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => (parse(readFileSync(join(DIR, file), 'utf8')) as { name: string }).name);
const length = (text: string) => [...text].length;

describe('region page meta (spec 029)', () => {
  it.each(NAMES)('AC12: %s has a title ≤ 60 and a description of 70–160 characters', (name) => {
    expect(length(ui.regions.pageTitle(name))).toBeLessThanOrEqual(60);
    const description = ui.regions.pageDescription(name);
    expect(length(description)).toBeGreaterThanOrEqual(70);
    expect(length(description)).toBeLessThanOrEqual(160);
  });

  it('AC12: the overview title and description fit', () => {
    expect(length(ui.regions.title)).toBeLessThanOrEqual(60);
    expect(length(ui.regions.description)).toBeGreaterThanOrEqual(70);
    expect(length(ui.regions.description)).toBeLessThanOrEqual(160);
  });
});
