import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { PROVINCE_PROFILE_SOURCES } from '@tests/fixtures/records';

/** Bulgarian names (plural, definite) of the species keys in the reference CSV. */
const SPECIES_NAMES: Readonly<Record<string, string>> = {
  sweet_cherries: 'черешите',
  plums: 'сливите',
  walnuts: 'орехите',
  apples: 'ябълките',
  peaches_nectarines: 'прасковите и нектарините',
  apricots: 'кайсиите',
  almonds: 'бадемите',
  raspberries: 'малините',
  sour_cherries: 'вишните',
  hazelnuts: 'лешниците',
  pears: 'крушите',
};

const REGIONS_DIR = join(process.cwd(), 'src', 'data', 'regions');
const [header = '', ...lines] = readFileSync(
  join(process.cwd(), 'tests', 'fixtures', 'regions', 'province-profile-2025.csv'),
  'utf8',
)
  .trim()
  .split('\n');
const columns = header.split(',');
const rows = lines.map((line) => {
  const cells = line.split(',');
  const cell = (name: string) => cells[columns.indexOf(name)] ?? '';
  const fruit = (name: string) => {
    const [key = '', area = ''] = cell(name).split(' ');
    return { key, name: SPECIES_NAMES[key], areaHa: Number(area) };
  };
  return {
    slug: cell('slug'),
    utilisedAreaHa: Number(cell('uaa_2025_ha')),
    arableHa: Number(cell('arable_ha')),
    grasslandHa: Number(cell('grassland_ha')),
    grasslandPercent: Number(cell('grassland_pct_uaa')),
    topFruits: [fruit('top_fruit_1'), fruit('top_fruit_2')],
    confidential: cell('confidential_cells').split(' '),
  };
});

const profileOf = (slug: string) =>
  regionSchema.parse(parse(readFileSync(join(REGIONS_DIR, `${slug}.yaml`), 'utf8'))).profile;

describe('province profiles content (spec 038)', () => {
  it('AC12: the reference table covers exactly the 28 region files', () => {
    const files = readdirSync(REGIONS_DIR)
      .filter((file) => file.endsWith('.yaml'))
      .map((file) => file.replace(/\.yaml$/, ''));
    expect(rows).toHaveLength(28);
    expect(new Set(rows.map((row) => row.slug))).toEqual(new Set(files));
  });

  it.each(rows)('AC12: $slug has the МЗХ figures of the reference table', (row) => {
    const profile = profileOf(row.slug);
    expect(profile, row.slug).toBeDefined();
    expect(profile?.utilisedAreaHa).toBe(row.utilisedAreaHa);
    expect(profile?.arableHa).toBe(row.arableHa);
    expect(profile?.grasslandHa).toBe(row.grasslandHa);
    expect(
      Math.abs((100 * row.grasslandHa) / row.utilisedAreaHa - row.grasslandPercent),
    ).toBeLessThanOrEqual(0.05);
    expect(profile?.topFruits).toEqual(row.topFruits.map(({ name, areaHa }) => ({ name, areaHa })));
    for (const { key } of row.topFruits) expect(row.confidential).not.toContain(key);
    expect(profile?.sources).toEqual(PROVINCE_PROFILE_SOURCES);
  });
});
