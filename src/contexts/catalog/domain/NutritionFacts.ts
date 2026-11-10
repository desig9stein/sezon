import { InvalidNutritionFactsError } from '@shared/domain/errors';
import { frozenRecords } from '@shared/domain/freeze';
import type { Source } from './Source';

/** Amount of one micronutrient per 100 g, in the unit defined by the nutrient. */
export interface MicronutrientAmount {
  readonly nutrientSlug: string;
  readonly amount: number;
}

/** Input for {@link NutritionFacts.create}. */
export interface NutritionFactsInput {
  readonly energyKcal: number;
  readonly proteinG: number;
  readonly fatG: number;
  readonly carbohydrateG: number;
  readonly fiberG: number;
  readonly sugarsG?: number | undefined;
  readonly micronutrients: ReadonlyArray<MicronutrientAmount>;
  readonly source: Source;
}

/** Nutrition values per 100 g of raw edible portion, with their source. */
export class NutritionFacts {
  readonly energyKcal: number;
  readonly proteinG: number;
  readonly fatG: number;
  readonly carbohydrateG: number;
  readonly fiberG: number;
  readonly sugarsG: number | undefined;
  readonly micronutrients: ReadonlyArray<MicronutrientAmount>;
  readonly source: Source;

  private constructor(input: NutritionFactsInput) {
    this.energyKcal = input.energyKcal;
    this.proteinG = input.proteinG;
    this.fatG = input.fatG;
    this.carbohydrateG = input.carbohydrateG;
    this.fiberG = input.fiberG;
    this.sugarsG = input.sugarsG;
    this.micronutrients = frozenRecords(input.micronutrients);
    this.source = Object.freeze({ ...input.source });
    Object.freeze(this);
  }

  /**
   * Creates nutrition facts.
   * @throws InvalidNutritionFactsError when a value is negative or not finite,
   * or a nutrient is listed more than once.
   */
  static create(input: NutritionFactsInput): NutritionFacts {
    const values: ReadonlyArray<[string, number | undefined]> = [
      ['energyKcal', input.energyKcal],
      ['proteinG', input.proteinG],
      ['fatG', input.fatG],
      ['carbohydrateG', input.carbohydrateG],
      ['fiberG', input.fiberG],
      ['sugarsG', input.sugarsG],
      ...input.micronutrients.map(({ nutrientSlug, amount }): [string, number] => [
        nutrientSlug,
        amount,
      ]),
    ];
    for (const [label, value] of values) {
      if (value !== undefined && !(Number.isFinite(value) && value >= 0)) {
        throw new InvalidNutritionFactsError(`${label} must be a non-negative number.`);
      }
    }
    const slugs = input.micronutrients.map(({ nutrientSlug }) => nutrientSlug);
    const repeated = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
    if (repeated !== undefined) {
      throw new InvalidNutritionFactsError(`Nutrient "${repeated}" is listed more than once.`);
    }
    return new NutritionFacts(input);
  }
}
