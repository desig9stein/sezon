import { createReadStream } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { parse } from 'yaml';
import { MACRO_NUTRIENT_IDS, MICRO_NUTRIENT_IDS } from './usdaNutrients.ts';

/**
 * Writes `tests/fixtures/usda/sr-legacy-extract.json`: for every FDC id cited by a produce in
 * `src/data/produce`, its description and the nutrients the site uses, read from the USDA
 * FoodData Central SR Legacy CSV release. Usage:
 * `node scripts/content/usda-extract.ts <path-to-FoodData_Central_sr_legacy_food_csv_2018-04>`.
 * Fails when a cited FDC id is not in the dataset.
 */

const PRODUCE_DIR = 'src/data/produce';
const OUTPUT = 'tests/fixtures/usda/sr-legacy-extract.json';
const DATASET = {
  name: 'USDA FoodData Central, SR Legacy (April 2018)',
  url: 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip',
};
const FDC_ID = /\/food-details\/(\d+)\//;
const NUTRIENT_IDS = new Set([
  ...Object.values(MACRO_NUTRIENT_IDS),
  ...Object.values(MICRO_NUTRIENT_IDS),
]);

/** Splits one CSV line with double-quoted fields into its values. */
function splitCsv(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted && char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

/** Calls `onRow` with each data row of a CSV file as a header → value record. */
async function eachRow(path: string, onRow: (row: Record<string, string>) => void): Promise<void> {
  let header: string[] | undefined;
  for await (const line of createInterface({ input: createReadStream(path) })) {
    const values = splitCsv(line);
    if (header === undefined) {
      header = values;
      continue;
    }
    const columns = header;
    onRow(Object.fromEntries(columns.map((name, index) => [name, values[index] ?? ''])));
  }
}

async function citedFdcIds(): Promise<Set<string>> {
  const files = (await readdir(PRODUCE_DIR)).filter((file) => file.endsWith('.yaml'));
  const ids = new Set<string>();
  for (const file of files) {
    const record = parse(await readFile(join(PRODUCE_DIR, file), 'utf8')) as {
      nutrition: { source: { url: string } };
    };
    const id = FDC_ID.exec(record.nutrition.source.url)?.[1];
    if (id === undefined) throw new Error(`${file}: the nutrition source is not an FDC item URL`);
    ids.add(id);
  }
  return ids;
}

async function extract(datasetDir: string): Promise<void> {
  const ids = await citedFdcIds();
  const foods: Record<string, { description: string; nutrients: Record<string, number> }> = {};
  await eachRow(join(datasetDir, 'food.csv'), (row) => {
    const id = row.fdc_id ?? '';
    if (ids.has(id)) foods[id] = { description: row.description ?? '', nutrients: {} };
  });
  const missing = [...ids].filter((id) => foods[id] === undefined);
  if (missing.length > 0) throw new Error(`FDC ids not in the dataset: ${missing.join(', ')}`);
  await eachRow(join(datasetDir, 'food_nutrient.csv'), (row) => {
    const food = foods[row.fdc_id ?? ''];
    const nutrientId = row.nutrient_id ?? '';
    if (food !== undefined && NUTRIENT_IDS.has(nutrientId)) {
      food.nutrients[nutrientId] = Number(row.amount);
    }
  });
  const sorted = Object.fromEntries(Object.entries(foods).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(OUTPUT, `${JSON.stringify({ dataset: DATASET, foods: sorted }, null, 2)}\n`);
  console.log(`${OUTPUT}: ${Object.keys(sorted).length} foods from ${DATASET.name}`);
}

const [datasetDir] = process.argv.slice(2);
if (datasetDir === undefined) {
  throw new Error('Usage: node scripts/content/usda-extract.ts <sr-legacy-csv-directory>');
}
await extract(datasetDir);
