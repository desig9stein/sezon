import type { SourceLanguage } from '@shared/domain/sourceLanguage';
import { isHttpsUrl } from '@shared/domain/contact';
import { InvalidRecipeError } from '@shared/domain/errors';
import { frozenList, frozenRecords } from '@shared/domain/freeze';
import { SLUG_PATTERN } from '@shared/domain/Slug';
import { isIngredientUnit, type IngredientUnit } from './IngredientUnit';
import { isRecipeCategory, type RecipeCategory } from './RecipeCategory';

/** A citation: a human-readable name and an https URL. */
export interface RecipeSource {
  readonly name: string;
  readonly url: string;
  /** Language of the name when it is not Bulgarian. */
  readonly lang?: SourceLanguage | undefined;
}

/** One ingredient: its name, a positive quantity and the unit of the quantity. */
export interface Ingredient {
  readonly name: string;
  readonly quantity: number;
  readonly unit: IngredientUnit;
}

/**
 * The food-safety part of a recipe: the safety note, the jar and processing note, the storage
 * note, and the food-safety sources every statement in them comes from.
 */
export interface RecipeSafety {
  readonly note: string;
  readonly sterilisation: string;
  readonly storage: string;
  readonly sources: ReadonlyArray<RecipeSource>;
}

/**
 * The water-bath time from an altitude upwards (spec 058): `minutes` apply from `fromMetres` up to
 * the next band's `fromMetres`, or without limit for the last band.
 */
export interface AltitudeProcessing {
  readonly fromMetres: number;
  readonly minutes: number;
}

/** Input for {@link Recipe.create}. */
export interface RecipeInput {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly category: RecipeCategory;
  readonly produceSlugs: ReadonlyArray<string>;
  readonly yield: string;
  /** Preparation minutes, only when a source gives them. */
  readonly prepMinutes?: number | undefined;
  /** Cooking minutes, only when a source gives them. */
  readonly cookMinutes?: number | undefined;
  /** Minutes in a boiling-water bath, for the largest jar at the lowest altitude band. */
  readonly processingMinutes: number;
  /** Minutes for the same jar in each higher altitude band, lowest first. */
  readonly processingAtAltitude: ReadonlyArray<AltitudeProcessing>;
  /** Days of fermentation or maturing before the preserve is ready. */
  readonly waitDays: number;
  readonly ingredients: ReadonlyArray<Ingredient>;
  readonly steps: ReadonlyArray<string>;
  readonly safety: RecipeSafety;
  /** The recipe articles the recipe is based on. */
  readonly sources: ReadonlyArray<RecipeSource>;
  readonly publishedAt: Date;
  readonly updatedAt: Date;
}

/** A recipe for a winter preserve, with its food-safety notes and sources. */
export class Recipe {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly category: RecipeCategory;
  readonly produceSlugs: ReadonlyArray<string>;
  readonly yield: string;
  readonly prepMinutes: number | undefined;
  readonly cookMinutes: number | undefined;
  readonly processingMinutes: number;
  readonly processingAtAltitude: ReadonlyArray<AltitudeProcessing>;
  readonly waitDays: number;
  readonly ingredients: ReadonlyArray<Ingredient>;
  readonly steps: ReadonlyArray<string>;
  readonly safety: RecipeSafety;
  readonly sources: ReadonlyArray<RecipeSource>;
  readonly publishedAt: Date;
  readonly updatedAt: Date;

  private constructor(input: RecipeInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.summary = input.summary;
    this.category = input.category;
    this.produceSlugs = frozenList(input.produceSlugs);
    this.yield = input.yield;
    this.prepMinutes = input.prepMinutes;
    this.cookMinutes = input.cookMinutes;
    this.processingMinutes = input.processingMinutes;
    this.processingAtAltitude = frozenRecords(input.processingAtAltitude);
    this.waitDays = input.waitDays;
    this.ingredients = frozenRecords(input.ingredients);
    this.steps = frozenList(input.steps);
    this.safety = Object.freeze({
      ...input.safety,
      sources: frozenRecords(input.safety.sources),
    });
    this.sources = frozenRecords(input.sources);
    this.publishedAt = new Date(input.publishedAt);
    this.updatedAt = new Date(input.updatedAt);
    Object.freeze(this);
  }

  /**
   * Creates a recipe.
   * @throws InvalidRecipeError when the slug is not a slug; a text is blank; the category or a
   * unit is unknown; there is no produce, ingredient, step, recipe source or safety source; a
   * produce is listed twice; a quantity is not positive; a time is not a non-negative integer; the
   * altitude bands are missing, do not rise or take less time than a lower band; a source is not
   * HTTPS; a date is invalid; or `updatedAt` is before `publishedAt`.
   */
  static create(input: RecipeInput): Recipe {
    const problem = findProblem(input);
    if (problem !== undefined) {
      throw new InvalidRecipeError(`Recipe "${input.slug}" ${problem}.`);
    }
    return new Recipe(input);
  }

  /** Returns `true` when the recipe uses the produce with `produceSlug`. */
  uses(produceSlug: string): boolean {
    return this.produceSlugs.includes(produceSlug);
  }
}

const isBlank = (text: string): boolean => text.trim() === '';
const isWholeNonNegative = (value: number): boolean => Number.isInteger(value) && value >= 0;
const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime());

function findSourceProblem(sources: ReadonlyArray<RecipeSource>, label: string) {
  if (sources.length === 0) return `has no ${label}`;
  const bad = sources.find((source) => isBlank(source.name) || !isHttpsUrl(source.url));
  return bad === undefined
    ? undefined
    : `has a ${label} that is not a named HTTPS link: ${bad.url}`;
}

function findIngredientProblem(ingredients: ReadonlyArray<Ingredient>): string | undefined {
  if (ingredients.length === 0) return 'has no ingredient';
  for (const ingredient of ingredients) {
    if (isBlank(ingredient.name)) return 'has an ingredient without a name';
    if (!(Number.isFinite(ingredient.quantity) && ingredient.quantity > 0)) {
      return `has a non-positive quantity of "${ingredient.name}"`;
    }
    if (!isIngredientUnit(ingredient.unit)) return `has an unknown unit "${ingredient.unit}"`;
  }
  return undefined;
}

/**
 * Returns why the altitude bands are invalid, or `undefined`: there must be at least one band, the
 * altitudes positive integers that rise, and the minutes integers that never fall below the band
 * below (starting from `processingMinutes`).
 */
function findAltitudeProblem(
  lowestMinutes: number,
  bands: ReadonlyArray<AltitudeProcessing>,
): string | undefined {
  if (bands.length === 0) return 'has no water-bath time above the lowest altitude';
  let previous = { fromMetres: 0, minutes: lowestMinutes };
  for (const band of bands) {
    if (!Number.isInteger(band.fromMetres) || band.fromMetres <= previous.fromMetres) {
      return 'has altitude bands that do not rise in whole metres';
    }
    if (!Number.isInteger(band.minutes) || band.minutes < previous.minutes) {
      return 'has a water-bath time that falls with altitude or is not whole';
    }
    previous = band;
  }
  return undefined;
}

function findProblem(input: RecipeInput): string | undefined {
  if (!SLUG_PATTERN.test(input.slug)) return 'has a slug that is not a slug';
  if (isBlank(input.name) || isBlank(input.summary) || isBlank(input.yield)) {
    return 'has a blank title, summary or yield';
  }
  if (!isRecipeCategory(input.category)) return `has an unknown category "${input.category}"`;
  if (input.produceSlugs.length === 0) return 'uses no produce';
  if (new Set(input.produceSlugs).size !== input.produceSlugs.length) {
    return 'lists a produce twice';
  }
  const times = [input.prepMinutes, input.cookMinutes, input.processingMinutes, input.waitDays];
  if (!times.every((time) => time === undefined || isWholeNonNegative(time)))
    return 'has a time that is not a whole non-negative number';
  const safety = input.safety;
  if ([safety.note, safety.sterilisation, safety.storage].some(isBlank)) {
    return 'has a blank safety, sterilisation or storage note';
  }
  if (input.steps.length === 0 || input.steps.some(isBlank)) return 'has no steps or a blank step';
  if (!isValidDate(input.publishedAt) || !isValidDate(input.updatedAt))
    return 'has an invalid date';
  if (input.updatedAt.getTime() < input.publishedAt.getTime()) {
    return 'was updated before it was published';
  }
  return (
    findAltitudeProblem(input.processingMinutes, input.processingAtAltitude) ??
    findIngredientProblem(input.ingredients) ??
    findSourceProblem(input.sources, 'recipe source') ??
    findSourceProblem(safety.sources, 'safety source')
  );
}
