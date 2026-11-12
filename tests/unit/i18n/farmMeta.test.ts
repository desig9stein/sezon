import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { SITE_NAME, ui } from '@i18n/bg';

/** The suffix BaseLayout adds to every title. */
const SITE_SUFFIX = ` | ${SITE_NAME}`;

const DATA = join(process.cwd(), 'src', 'data');
const read = (dir: string) =>
  readdirSync(join(DATA, dir))
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => ({
      slug: file.replace(/\.yaml$/, ''),
      data: parse(readFileSync(join(DATA, dir, file), 'utf8')) as Record<string, unknown>,
    }));
const produceNames = new Map(read('produce').map(({ slug, data }) => [slug, data.name as string]));
const regionNames = new Map(read('regions').map(({ slug, data }) => [slug, data.name as string]));
const farms = read('farms').map(({ data }) => ({
  name: data.name as string,
  region: regionNames.get(data.region as string) ?? '',
  produce: (data.produce as string[]).map((slug) => produceNames.get(slug) ?? slug),
}));
const length = (text: string) => [...text].length;

describe('farm page meta (spec 030)', () => {
  it.each(farms)('AC7: $name has a title ≤ 60 and a description of 70–160 characters', (farm) => {
    expect(length(`${ui.farms.pageTitle(farm.name)}${SITE_SUFFIX}`)).toBeLessThanOrEqual(60);
    const description = ui.farms.pageDescription(farm.name, farm.region, farm.produce);
    expect(length(description)).toBeGreaterThanOrEqual(70);
    expect(length(description)).toBeLessThanOrEqual(160);
  });

  it('AC7: uses „във“ before в and ф and lists the produce', () => {
    const description = ui.farms.pageDescription('Био градина', 'Варна', ['Копър', 'Магданоз']);
    expect(description).toContain('във Варна');
    expect(description).toContain('предлага копър, магданоз');
    expect(ui.farms.pageDescription('Ферма', 'Фиктивна', ['Копър'])).toContain('във Фиктивна');
  });

  it('AC7: shortens a long produce list to fit', () => {
    const many = Array.from({ length: 30 }, (_, index) => `Продукт ${index + 1}`);
    expect(length(ui.farms.pageDescription('Венец', 'Плевен', many))).toBeLessThanOrEqual(160);
  });

  it('AC7: the farm list title and description fit', () => {
    expect(length(ui.farms.title)).toBeLessThanOrEqual(60);
    expect(length(ui.farms.description)).toBeGreaterThanOrEqual(70);
    expect(length(ui.farms.description)).toBeLessThanOrEqual(160);
  });
});
