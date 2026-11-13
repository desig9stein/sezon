import { describe, expect, it } from 'vitest';
import { CATALOG_AREAS, routes } from '@components/layout/routes';
import { INGREDIENT_UNITS, RECIPE_CATEGORIES } from '@contexts/recipes';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { formatDuration, ui } from '@i18n/bg';
import {
  characterCount,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from '@shared/seo';
import { readSeedCollection } from '@tests/fixtures/seedData';

const SUFFIX_LENGTH = characterCount(` | ${ui.siteName}`);
const fitsTitle = (title: string) => characterCount(title) + SUFFIX_LENGTH <= TITLE_MAX_LENGTH;
const fitsDescription = (description: string) => {
  const length = characterCount(description);
  return length >= DESCRIPTION_MIN_LENGTH && length <= DESCRIPTION_MAX_LENGTH;
};

const recipes = readSeedCollection('recipes').map(({ id, data }) => ({
  id,
  ...recipeSchema.parse(data),
}));

describe('recipe page strings (spec 048)', () => {
  it('AC8: there are seed recipes to check', () => {
    expect(recipes.length).toBeGreaterThan(0);
  });

  it('AC8: every recipe title fits 60 characters with the suffix', () => {
    const tooLong = recipes
      .map(({ title }) => ui.recipes.pageTitle(title))
      .filter((title) => !fitsTitle(title));
    expect(tooLong).toEqual([]);
  });

  it('AC8: every recipe description is 70–160 characters', () => {
    expect(recipes.filter(({ summary }) => !fitsDescription(summary)).map(({ id }) => id)).toEqual(
      [],
    );
  });

  it('AC8: a recipe title names it as a recipe for the winter when it fits', () => {
    expect(ui.recipes.pageTitle('Кисело зеле')).toBe('Кисело зеле – рецепта за зимнина');
    expect(ui.recipes.pageTitle('Б'.repeat(50))).toBe('Б'.repeat(50));
  });

  it('AC8: the index title and description fit', () => {
    expect(fitsTitle(ui.recipes.title)).toBe(true);
    expect(fitsDescription(ui.recipes.description)).toBe(true);
    expect(ui.recipes.heading).toBe('Рецепти за зимнина');
  });

  it('AC8: every category and unit has a label', () => {
    for (const category of RECIPE_CATEGORIES) {
      expect(ui.recipes.categories[category], category).toMatch(/\S/);
      expect(ui.recipes.categoryHeadings[category], category).toMatch(/\S/);
    }
    for (const unit of INGREDIENT_UNITS) expect(ui.recipes.units[unit], unit).toMatch(/\S/);
    expect(ui.recipes.categories.sauerkraut).toBe('кисело зеле');
    expect(ui.recipes.categories.compote).toBe('компот');
  });

  it('AC8: formats an ingredient with a decimal comma and a lower-case name', () => {
    expect(ui.recipes.ingredient({ name: 'Бяло зеле', quantity: 2.3, unit: 'kg' })).toBe(
      '2,3 кг бяло зеле',
    );
    expect(ui.recipes.ingredient({ name: 'Круши', quantity: 10, unit: 'piece' })).toBe(
      '10 бр. круши',
    );
  });

  it.each([
    [25, '25 мин'],
    [60, '1 ч'],
    [65, '1 ч 5 мин'],
    [0, '–'],
  ])('AC8: formatDuration(%i) is %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it('AC8: routes and catalogue areas include the recipes', () => {
    expect(routes.recipes).toBe('/retsepti');
    expect(routes.recipe('kiselo-zele')).toBe('/retsepti/kiselo-zele');
    expect(CATALOG_AREAS).toContain('/retsepti');
  });

  it('AC8: the produce block and catalogue strings exist', () => {
    expect(ui.produce.headings.recipes).toBe('Рецепти за зимнина');
    expect(ui.catalog.recipesLink).toMatch(/рецепти/i);
  });
});
