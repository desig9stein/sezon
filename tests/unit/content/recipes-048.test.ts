import { describe, expect, it } from 'vitest';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { Slug } from '@shared/domain/Slug';
import { readSeedCollection } from '@tests/fixtures/seedData';
import { formalFormsInText, ownStrings } from '@tests/fixtures/voice';

const MIN_RECIPES = 8;
/** Hosts accepted as food-safety sources: public food-safety bodies and university extension. */
const SAFETY_HOSTS = [
  /^nchfp\.uga\.edu$/,
  /^ask\.extension\.org$/,
  /(^|\.)babh\.government\.bg$/,
  /(^|\.)europa\.eu$/,
  /\.edu$/,
];
const HEALTH_CLAIMS = /богат на|богата на|богати на|полезн|лекува|лечеб/i;

const entries = readSeedCollection('recipes');
const parsed = entries.map(({ id, data }) => ({ id, result: recipeSchema.safeParse(data) }));
const recipes = parsed.flatMap(({ id, result }) =>
  result.success ? [{ id, ...result.data }] : [],
);
const produceIds = new Set(readSeedCollection('produce').map(({ id }) => id));

describe('seed recipes (spec 048, issue #70)', () => {
  it(`AC9: has at least ${MIN_RECIPES} recipes`, () => {
    expect(entries.length).toBeGreaterThanOrEqual(MIN_RECIPES);
  });

  it('AC9: every recipe matches the schema', () => {
    expect(
      parsed
        .filter(({ result }) => !result.success)
        .map(({ id, result }) => `${id}: ${result.error?.message ?? ''}`),
    ).toEqual([]);
  });

  it('AC9: every id is the slug of the title', () => {
    expect(
      recipes
        .filter(({ id, title }) => Slug.fromBulgarian(title).value !== id)
        .map(({ id, title }) => `${id} should be ${Slug.fromBulgarian(title).value}`),
    ).toEqual([]);
  });

  it('AC9: every recipe refers to existing produce', () => {
    expect(
      recipes.flatMap(({ id, produce }) =>
        produce.filter((slug) => !produceIds.has(slug)).map((slug) => `${id} → ${slug}`),
      ),
    ).toEqual([]);
  });

  it('AC9: every recipe has a recipe source and a food-safety source from a trusted host', () => {
    for (const recipe of recipes) {
      expect(recipe.sources.length, recipe.id).toBeGreaterThan(0);
      expect(recipe.safety.sources.length, recipe.id).toBeGreaterThan(0);
      for (const source of recipe.safety.sources) {
        const host = new URL(source.url).hostname;
        expect(
          SAFETY_HOSTS.some((pattern) => pattern.test(host)),
          `${recipe.id}: ${host}`,
        ).toBe(true);
      }
    }
  });

  it('AC9: every recipe is processed in a water bath or waits (ferments) before use', () => {
    expect(
      recipes
        .filter(({ processingMinutes, waitDays }) => processingMinutes === 0 && waitDays === 0)
        .map(({ id }) => id),
    ).toEqual([]);
  });

  it('AC9: every recipe uses the „ти“ voice', () => {
    expect(
      entries.flatMap(({ id, data }) =>
        ownStrings(data)
          .flatMap(formalFormsInText)
          .map((word) => `${id}: ${word}`),
      ),
    ).toEqual([]);
  });

  it('AC9: no recipe makes a health claim', () => {
    expect(
      entries.flatMap(({ id, data }) =>
        ownStrings(data)
          .filter((text) => HEALTH_CLAIMS.test(text))
          .map((text) => `${id}: ${text}`),
      ),
    ).toEqual([]);
  });
});
