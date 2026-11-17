import { describe, expect, it } from 'vitest';
import NutritionTable from '@components/produce/NutritionTable.astro';
import { NutritionFacts } from '@contexts/catalog';
import { aProduce } from '@tests/fixtures/produce';
import { render } from './render';

const produce = aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 9, level: 'peak' }] });
const SOURCE_URL = 'https://fdc.nal.usda.gov/';

const renderTable = (nutrition = produce.nutrition) =>
  render(NutritionTable, { nutrition, micronutrients: [] });

describe('NutritionTable (spec 060)', () => {
  it('AC7: explains РСП in a paragraph before the table and describes the table with it', async () => {
    const html = await renderTable();
    const note = /<p[^>]*id="([^"]+)"[^>]*>[^<]*РСП е референтният прием/.exec(html);
    expect(note).not.toBeNull();
    expect(html.indexOf(note?.[0] ?? '')).toBeLessThan(html.indexOf('<table'));
    expect(html).toMatch(new RegExp(`<table[^>]*aria-describedby="${note?.[1] ?? '-'}"`));
  });

  it('AC8: names the source without a second link to it', async () => {
    const html = await renderTable();
    expect(html).not.toContain(`href="${SOURCE_URL}"`);
    expect(html).toMatch(/<cite[^>]*>USDA FoodData Central[^<]*<\/cite>/);
  });

  it('AC4: marks an English source title with lang="en"', async () => {
    const english = produce.nutrition;
    expect(english).toBeDefined();
    const nutrition = NutritionFacts.create({
      ...(english as NutritionFacts),
      source: {
        name: 'USDA FoodData Central, SR Legacy: Cabbage, raw',
        url: SOURCE_URL,
        lang: 'en',
      },
    });
    const html = await renderTable(nutrition);
    expect(html).toMatch(/<cite[^>]*lang="en"[^>]*>USDA FoodData Central, SR Legacy: Cabbage, raw/);
  });
});
