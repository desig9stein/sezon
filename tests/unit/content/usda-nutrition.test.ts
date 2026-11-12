import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { MACRO_NUTRIENT_IDS, MICRO_NUTRIENT_IDS } from '../../../scripts/content/usdaNutrients';
import extract from '../../fixtures/usda/sr-legacy-extract.json';

interface ProduceNutrition {
  readonly source: { readonly name: string; readonly url: string };
  readonly micronutrients?: ReadonlyArray<{ readonly nutrient: string; readonly amount: number }>;
  readonly [key: string]: unknown;
}

const DIR = join(process.cwd(), 'src', 'data', 'produce');
const PRODUCE = readdirSync(DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => ({
    slug: file.replace(/\.yaml$/, ''),
    nutrition: (parse(readFileSync(join(DIR, file), 'utf8')) as { nutrition: ProduceNutrition })
      .nutrition,
  }));
const foods = extract.foods as Record<
  string,
  { readonly description: string; readonly nutrients: Record<string, number> }
>;
const fdcIdOf = (url: string) => /\/food-details\/(\d+)\//.exec(url)?.[1] ?? '';
const isUsda = (url: string) => new URL(url).hostname === 'fdc.nal.usda.gov';
const USDA_PRODUCE = PRODUCE.filter(({ nutrition }) => isUsda(nutrition.source.url));
/** Macronutrient fields every produce must give; sugars are optional in the content schema. */
const REQUIRED_MACROS = ['energyKcal', 'proteinG', 'fatG', 'carbohydrateG', 'fiberG'];
const SUGARS_ID = MACRO_NUTRIENT_IDS.sugarsG ?? '';
/** USDA descriptions add program notes in parentheses and commas the site's names omit. */
const normalise = (text: string) =>
  text
    .replace(/\s*\(Includes[^)]*\)/g, '')
    .replace(/[,\s]+/g, ' ')
    .trim()
    .toLowerCase();

describe('nutrition values against USDA SR Legacy (spec 032)', () => {
  it.each(PRODUCE)(
    'AC1: $slug cites an extracted FDC record by its description',
    ({ nutrition }) => {
      const food = foods[fdcIdOf(nutrition.source.url)];
      expect(food, 'run scripts/content/usda-extract.ts').toBeDefined();
      const cited = nutrition.source.name.replace(/^USDA FoodData Central, SR Legacy: /, '');
      expect(normalise(cited)).toBe(normalise(food?.description ?? ''));
    },
  );

  it.each(USDA_PRODUCE)('AC2: $slug has exactly the USDA values', ({ nutrition }) => {
    const values = foods[fdcIdOf(nutrition.source.url)]?.nutrients ?? {};
    for (const [field, id] of Object.entries(MACRO_NUTRIENT_IDS)) {
      if (nutrition[field] !== undefined) expect(nutrition[field], field).toBe(values[id]);
    }
    for (const { nutrient, amount } of nutrition.micronutrients ?? []) {
      const id = MICRO_NUTRIENT_IDS[nutrient];
      expect(id, `no FDC id mapped for ${nutrient}`).toBeDefined();
      expect(amount, nutrient).toBe(values[id ?? '']);
    }
  });

  it.each(USDA_PRODUCE)(
    'AC6: $slug gives every macronutrient USDA has, all mapped',
    ({ nutrition }) => {
      const values = foods[fdcIdOf(nutrition.source.url)]?.nutrients ?? {};
      for (const field of REQUIRED_MACROS) {
        expect(MACRO_NUTRIENT_IDS[field], `mapping for ${field}`).toBeDefined();
        expect(nutrition[field], field).toBeDefined();
      }
      if (values[SUGARS_ID] !== undefined) expect(nutrition.sugarsG, 'sugarsG').toBeDefined();
      const numericFields = Object.entries(nutrition)
        .filter(([, value]) => typeof value === 'number')
        .map(([field]) => field);
      for (const field of numericFields) {
        expect(MACRO_NUTRIENT_IDS[field], `no FDC id mapped for ${field}`).toBeDefined();
      }
    },
  );

  it.each(PRODUCE.filter(({ nutrition }) => !isUsda(nutrition.source.url)))(
    'AC7: $slug cites EFSA when it does not cite USDA',
    ({ nutrition }) => {
      expect(new URL(nutrition.source.url).hostname).toMatch(/(^|\.)efsa\.europa\.eu$/);
    },
  );
});
