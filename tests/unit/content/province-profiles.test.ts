import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { PROVINCE_PROFILE_SOURCES } from '@tests/fixtures/records';

/** Bulgarian names (plural, definite) of the species keys in the МЗХ orchard tables. */
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
  dessert_grapes: 'десертното грозде',
};
/** Table names that differ from the region file names. */
const TABLE_NAMES: Readonly<Record<string, string>> = { 'София-област': 'sofiyska' };
/** A cell the bulletin keeps confidential („с“); „-“ means no area. */
const CONFIDENTIAL = 'c';
const MAX_TOP_FRUITS = 2;

const FIXTURES = join(process.cwd(), 'tests', 'fixtures', 'regions');
const REGIONS_DIR = join(process.cwd(), 'src', 'data', 'regions');

/** Reads a CSV fixture into header-keyed rows. */
function csvRows(file: string): ReadonlyArray<Readonly<Record<string, string>>> {
  const [header = '', ...lines] = readFileSync(join(FIXTURES, file), 'utf8').trim().split('\n');
  const columns = header.split(',');
  return lines.map((line) => {
    const cells = line.split(',');
    return Object.fromEntries(columns.map((column, index) => [column, cells[index] ?? '']));
  });
}

const files = readdirSync(REGIONS_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/, ''));
const records = new Map(
  files.map((slug) => [
    slug,
    regionSchema.parse(parse(readFileSync(join(REGIONS_DIR, `${slug}.yaml`), 'utf8'))),
  ]),
);
const slugByName = new Map(
  [...records]
    .map(([slug, record]) => [record.name, slug] as const)
    .concat(Object.entries(TABLE_NAMES).map(([name, slug]) => [name, slug] as const)),
);

/** Orchard cells per province slug and species, and the published total per species. */
const orchardCells = new Map<string, Record<string, string>>();
const orchardTotals: Record<string, number> = {};
for (const file of ['orchard2023_table1_manual.csv', 'orchard2023_table2.csv']) {
  for (const { name = '', ...cells } of csvRows(file)) {
    if (name.toLowerCase() === 'total') {
      for (const [species, value] of Object.entries(cells)) orchardTotals[species] = Number(value);
      continue;
    }
    const slug = slugByName.get(name);
    if (slug === undefined) throw new Error(`Unknown province in the orchard table: ${name}`);
    orchardCells.set(slug, { ...orchardCells.get(slug), ...cells });
  }
}
const isKnown = (cell: string) => /^\d+$/.test(cell);
/** Hectares the confidential cells of a species can hold at most: total minus known cells. */
const residuals = Object.fromEntries(
  Object.entries(orchardTotals).map(([species, total]) => [
    species,
    total -
      [...orchardCells.values()]
        .map((cells) => cells[species] ?? '')
        .filter(isKnown)
        .reduce((sum, cell) => sum + Number(cell), 0),
  ]),
);

/**
 * Returns the top fruits the bulletin supports for a province: the largest known species, as many
 * (up to two) as are larger than every confidential residual that could apply there and not tied
 * with the next species.
 */
function supportedTopFruits(slug: string): ReadonlyArray<{ name: string; areaHa: number }> {
  const cells = orchardCells.get(slug) ?? {};
  const known = Object.entries(cells)
    .filter(([, cell]) => isKnown(cell))
    .map(([species, cell]) => ({ species, areaHa: Number(cell) }))
    .sort((a, b) => b.areaHa - a.areaHa);
  const hidden = Math.max(
    0,
    ...Object.entries(cells)
      .filter(([, cell]) => cell === CONFIDENTIAL)
      .map(([species]) => residuals[species] ?? Number.POSITIVE_INFINITY),
  );
  for (let count = MAX_TOP_FRUITS; count > 0; count -= 1) {
    const last = known[count - 1];
    const next = known[count];
    if (last === undefined) continue;
    if (hidden < last.areaHa && next?.areaHa !== last.areaHa) {
      return known
        .slice(0, count)
        .map(({ species, areaHa }) => ({ name: SPECIES_NAMES[species] ?? species, areaHa }));
    }
  }
  return [];
}

const [bansikSource, orchardSource] = PROVINCE_PROFILE_SOURCES;
const profileRows = csvRows('province-profile-2025.csv');

describe('province profiles content (spec 038)', () => {
  it('AC12: the reference tables cover exactly the 28 region files', () => {
    expect(profileRows).toHaveLength(28);
    expect(new Set(profileRows.map((row) => row.slug))).toEqual(new Set(files));
    expect(new Set(orchardCells.keys())).toEqual(new Set(files));
  });

  it.each(profileRows.map((row) => [row.slug ?? '', row] as const))(
    'AC12: %s has the БАНСИК figures of the reference table',
    (slug, row) => {
      const profile = records.get(slug)?.profile;
      expect(profile, slug).toBeDefined();
      expect(profile?.utilisedAreaHa).toBe(Number(row.uaa_2025_ha));
      expect(profile?.arableHa).toBe(Number(row.arable_ha));
      expect(profile?.grasslandHa).toBe(Number(row.grassland_ha));
      expect(
        Math.abs(
          (100 * Number(row.grassland_ha)) / Number(row.uaa_2025_ha) -
            Number(row.grassland_pct_uaa),
        ),
      ).toBeLessThanOrEqual(0.05);
    },
  );
});

describe('province profiles content, QA (spec 038)', () => {
  it('AC12: the confidential residuals are computed from the raw tables', () => {
    expect(residuals.pears).toBe(50);
    expect(residuals.raspberries).toBe(14);
  });

  it.each(files)('AC12: %s lists exactly the top fruits the orchard bulletin supports', (slug) => {
    expect(records.get(slug)?.profile?.topFruits ?? []).toEqual(supportedTopFruits(slug));
  });

  it('AC12: Smolyan and Sofia city list no top fruits', () => {
    expect(records.get('smolyan')?.profile?.topFruits ?? []).toEqual([]);
    expect(records.get('sofia-grad')?.profile?.topFruits ?? []).toEqual([]);
  });

  it.each(files)('AC16: %s cites the bulletins of its survey years', (slug) => {
    const profile = records.get(slug)?.profile;
    const hasFruits = (profile?.topFruits ?? []).length > 0;
    expect(profile?.sources).toEqual(hasFruits ? [bansikSource, orchardSource] : [bansikSource]);
    expect(profile?.sources[0]?.name).toContain(`БАНСИК ${profile?.areaYear}:`);
    if (hasFruits) {
      expect(profile?.sources[1]?.name).toContain(`през ${profile?.orchardYear} година`);
    } else {
      expect(profile?.orchardYear).toBeUndefined();
    }
  });
});
