import { describe, expect, it } from 'vitest';
import { RecipePagesQuery } from '@composition/RecipePagesQuery';
import { IndexedRecipeRepository } from '@contexts/recipes/infrastructure/IndexedRecipeRepository';
import { toRecipe } from '@contexts/recipes/infrastructure/mappers';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { formatDuration, ui } from '@i18n/bg';
import { hoursAndMinutes } from '@shared/domain/duration';
import { recipeJsonLd } from '@shared/seo';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { aRecipe, rawRecipeRecord } from '@tests/fixtures/recipes';

const jsonLdInput = {
  siteUrl: 'https://sezon.example',
  path: '/retsepti/kiselo-zele',
  name: 'Кисело зеле',
  description: 'Нарязано кисело зеле в буркан.',
  category: 'кисело зеле',
  yield: 'около 1,7 л',
  ingredients: ['2,3 кг бяло зеле'],
  steps: ['Нарежи зелето.'],
  processingMinutes: 15,
  waitDays: 21,
  datePublished: new Date('2026-11-13'),
  dateModified: new Date('2026-11-13'),
  citations: [],
};

describe('QA 048 regressions: sourced times only', () => {
  it('QA 048: the schema accepts a recipe without preparation or cooking time', () => {
    const record = rawRecipeRecord();
    delete record.prepMinutes;
    delete record.cookMinutes;
    const recipe = toRecipe('kompot-ot-krushi', recipeSchema.parse(record));
    expect(recipe.prepMinutes).toBeUndefined();
    expect(recipe.cookMinutes).toBeUndefined();
  });

  it('QA 048: a recipe without times is valid', () => {
    expect(aRecipe({ prepMinutes: undefined, cookMinutes: undefined }).cookMinutes).toBeUndefined();
  });

  it('QA 048: JSON-LD has no prepTime, cookTime or totalTime when they are not sourced', () => {
    const data = recipeJsonLd(jsonLdInput);
    expect(data).not.toHaveProperty('prepTime');
    expect(data).not.toHaveProperty('cookTime');
    expect(data).not.toHaveProperty('totalTime');
  });

  it('QA 048: JSON-LD has cookTime alone when only cooking is sourced', () => {
    const data = recipeJsonLd({ ...jsonLdInput, cookMinutes: 30 });
    expect(data.cookTime).toBe('PT30M');
    expect(data).not.toHaveProperty('prepTime');
    expect(data).not.toHaveProperty('totalTime');
  });

  it('QA 048: JSON-LD has totalTime only when every part is sourced', () => {
    const data = recipeJsonLd({ ...jsonLdInput, prepMinutes: 40, cookMinutes: 10 });
    expect(data.prepTime).toBe('PT40M');
    expect(data.totalTime).toBe('P21DT1H5M');
  });
});

describe('QA 048 regressions: shared helpers', () => {
  it('QA 048: hoursAndMinutes splits minutes for both the page and the JSON-LD', () => {
    expect(hoursAndMinutes(65)).toEqual({ hours: 1, minutes: 5 });
    expect(hoursAndMinutes(25)).toEqual({ hours: 0, minutes: 25 });
    expect(formatDuration(125)).toBe('2 ч 5 мин');
  });

  it('QA 048: RecipePagesQuery needs only the recipe and produce repositories', async () => {
    const query = new RecipePagesQuery({
      recipes: new IndexedRecipeRepository(async () => [aRecipe()]),
      produce: produceRepositoryOf([
        aProduce({ slug: 'krushi', name: 'Круши', season: [{ month: 9, level: 'peak' }] }),
      ]),
    });
    expect((await query.overview())[0]?.category).toBe('compote');
  });
});

describe('QA 048 regressions: the shared boiling-water-bath paragraph', () => {
  const bath = ui.recipes.waterBath;

  it('QA 048: states water depth, timing, restart, cooling, seal check and unsealed jars', () => {
    const text = bath.items.join(' ');
    for (const fact of [
      '2,5 см',
      'над 30 минути',
      '5 см',
      'от момента, в който водата заври',
      'отначало',
      '12–24 часа',
      'натисни средата',
      'вдлъбнат',
      '24 часа',
      'до седмица',
      'нови',
    ]) {
      expect(text, fact).toContain(fact);
    }
    expect(bath.heading).toMatch(/\S/);
  });

  it('QA 048: no time is called approximate any more', () => {
    expect(JSON.stringify(ui.recipes)).not.toContain('ориентировъчни');
  });
});
