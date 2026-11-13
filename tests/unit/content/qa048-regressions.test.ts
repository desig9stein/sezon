import { describe, expect, it } from 'vitest';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { readSeedCollection } from '@tests/fixtures/seedData';

const recipes = readSeedCollection('recipes').map(({ id, data }) => ({
  id,
  ...recipeSchema.parse(data),
}));
const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
const recipe = (id: string) => {
  const found = byId.get(id);
  if (found === undefined) throw new Error(`No recipe ${id}`);
  return found;
};

const NCHFP = 'https://nchfp.uga.edu';
const BOILING_WATER_CANNERS = `${NCHFP}/publications/uga-publications/using-boiling-water-canners`;
const JARS_AND_LIDS = `${NCHFP}/how/can/general-information/recommended-jars-and-lids/`;
const RECIPE_HOSTS = [/(^|\.)bgfermer\.bg$/, /(^|\.)agrozona\.bg$/];
const SWEET_SPREADS = new Set(['preserve', 'jam']);
const FROM_THE_BOIL = 'от момента, в който водата заври';

describe('QA 048 regressions: recipes whose safety is fully sourced', () => {
  it('QA 048: keeps only the five fully sourced recipes', () => {
    expect(recipes.map(({ id }) => id).sort()).toEqual([
      'kiselo-zele',
      'kompot-ot-krushi',
      'kompot-ot-praskovi',
      'sladko-ot-sini-slivi',
      'sladko-ot-yabalki',
    ]);
  });

  it('QA 048: recipe sources are editorial recipe portals, not user-submitted sites', () => {
    for (const { id, sources } of recipes) {
      for (const source of sources) {
        const host = new URL(source.url).hostname;
        expect(
          RECIPE_HOSTS.some((pattern) => pattern.test(host)),
          `${id}: ${host}`,
        ).toBe(true);
      }
    }
  });

  it('QA 048: every recipe cites Using Boiling Water Canners and Recommended Jars and Lids', () => {
    for (const { id, safety } of recipes) {
      const urls = safety.sources.map(({ url }) => url);
      expect(urls, id).toContain(BOILING_WATER_CANNERS);
      expect(urls, id).toContain(JARS_AND_LIDS);
    }
  });

  it('QA 048: every processing step times from the moment the water boils', () => {
    for (const { id, steps } of recipes) {
      const processing = steps.filter((step) => step.startsWith('Вари бурканите'));
      expect(processing, id).toHaveLength(1);
      expect(processing[0], id).toContain(FROM_THE_BOIL);
    }
  });

  it('QA 048: every sterilisation note covers altitudes above 1800 m', () => {
    for (const { id, safety } of recipes) {
      expect(safety.sterilisation, id).toMatch(/над 1800 м/);
    }
  });

  it('QA 048: sweet spreads use the preserve process: 5, 10, 15 min, jars up to 470 ml', () => {
    const spreads = recipes.filter(({ category }) => SWEET_SPREADS.has(category));
    expect(spreads.length).toBeGreaterThan(0);
    for (const { id, processingMinutes, safety } of spreads) {
      expect(processingMinutes, id).toBe(5);
      expect(safety.sterilisation, id).toMatch(/5 минути до 300 м/);
      expect(safety.sterilisation, id).toMatch(/10 минути от 300 до 1800 м/);
      expect(safety.sterilisation, id).toMatch(/15 минути над 1800 м/);
      expect(safety.sterilisation, id).toContain('до 470 мл');
      expect(
        safety.sources.some(({ url }) => /\/how\/make-jam-jelly\/.*preserves/.test(url)),
        id,
      ).toBe(true);
    }
  });

  it('QA 048: the plum preserve cites NCHFP Plum Preserves and the apple one Apple Preserves', () => {
    expect(recipe('sladko-ot-sini-slivi').safety.sources.map(({ url }) => url)).toContain(
      `${NCHFP}/how/make-jam-jelly/preserves/plum-preserves/`,
    );
    expect(recipe('sladko-ot-yabalki').safety.sources.map(({ url }) => url)).toContain(
      `${NCHFP}/how/make-jam-jelly/jams/apple-preserves-pectin/`,
    );
  });

  it('QA 048: times are only those the sources give', () => {
    const times = Object.fromEntries(
      recipes.map(({ id, prepMinutes, cookMinutes }) => [id, { prepMinutes, cookMinutes }]),
    );
    expect(times).toEqual({
      'kiselo-zele': { prepMinutes: undefined, cookMinutes: undefined },
      'kompot-ot-krushi': { prepMinutes: undefined, cookMinutes: 5 },
      'kompot-ot-praskovi': { prepMinutes: undefined, cookMinutes: undefined },
      'sladko-ot-sini-slivi': { prepMinutes: undefined, cookMinutes: 55 },
      'sladko-ot-yabalki': { prepMinutes: undefined, cookMinutes: 30 },
    });
  });

  it('QA 048: the pear compote syrup is called very light', () => {
    const pears = recipe('kompot-ot-krushi');
    const texts = [pears.summary, ...pears.steps];
    expect(texts.some((text) => text.includes('много лек захарен сироп'))).toBe(true);
    expect(texts.filter((text) => /(?<!много )лек /.test(text))).toEqual([]);
  });

  it('QA 048: the sauerkraut wording follows NCHFP', () => {
    const steps = recipe('kiselo-zele').steps.join(' ');
    expect(steps).toContain('24–48 часа след берането');
    expect(steps).toContain('поне 10–13 см над зелето');
    expect(steps).toMatch(/Загрей бавно[^.]*свали го от огъня/);
  });
});
