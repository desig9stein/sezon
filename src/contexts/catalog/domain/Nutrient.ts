import { InvalidNutrientError } from '@shared/domain/errors';
import type { Source } from './Source';

/** Nutrient kinds as stored in content. */
export const NUTRIENT_KINDS = ['vitamin', 'mineral'] as const;
/** Units in which nutrient amounts are expressed. */
export const NUTRIENT_UNITS = ['mg', 'µg'] as const;

export type NutrientKind = (typeof NUTRIENT_KINDS)[number];
export type NutrientUnit = (typeof NUTRIENT_UNITS)[number];

const PERCENT = 100;
/** % of the reference intake per 100 g from which a food is a „source of“ a nutrient (EU 1169/2011). */
export const SOURCE_PERCENT = 15;
/** % of the reference intake per 100 g from which a food is „high in“ a nutrient (EU 1924/2006). */
export const HIGH_PERCENT = SOURCE_PERCENT * 2;

/** Nutrition claim a food may carry for a nutrient: „high in“ or „source of“. */
export type ClaimLevel = 'high' | 'source';

/** Input for {@link Nutrient.create}. */
export interface NutrientInput {
  readonly slug: string;
  readonly name: string;
  readonly kind: NutrientKind;
  readonly unit: NutrientUnit;
  readonly referenceIntake: number;
  readonly claims: ReadonlyArray<string>;
  readonly claimsSource: Source;
  readonly note?: string | undefined;
}

/** A vitamin or mineral with its EU adult reference intake (NRV). */
export class Nutrient {
  readonly slug: string;
  readonly name: string;
  readonly kind: NutrientKind;
  readonly unit: NutrientUnit;
  readonly referenceIntake: number;
  /** Authorised health claims (Regulation (EU) No 432/2012), verbatim, without a full stop. */
  readonly claims: ReadonlyArray<string>;
  readonly claimsSource: Source;
  readonly note: string | undefined;

  private constructor(input: NutrientInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.kind = input.kind;
    this.unit = input.unit;
    this.referenceIntake = input.referenceIntake;
    this.claims = Object.freeze([...input.claims]);
    this.claimsSource = Object.freeze({ ...input.claimsSource });
    this.note = input.note;
    Object.freeze(this);
  }

  /**
   * Creates a nutrient.
   * @throws InvalidNutrientError when `referenceIntake` is not a positive finite number or
   * `claims` is empty.
   */
  static create(input: NutrientInput): Nutrient {
    if (!(Number.isFinite(input.referenceIntake) && input.referenceIntake > 0)) {
      throw new InvalidNutrientError(
        `Reference intake of "${input.slug}" must be a positive number.`,
      );
    }
    if (input.claims.length === 0) {
      throw new InvalidNutrientError(`Nutrient "${input.slug}" needs at least one claim.`);
    }
    return new Nutrient(input);
  }

  /**
   * Returns `amount` as a percentage of the reference intake, rounded to an integer.
   * @throws InvalidNutrientError when `amount` is negative or not finite.
   */
  percentOfReferenceIntake(amount: number): number {
    if (!(Number.isFinite(amount) && amount >= 0)) {
      throw new InvalidNutrientError(`Amount ${amount} must be a non-negative number.`);
    }
    return Math.round((amount / this.referenceIntake) * PERCENT);
  }

  /**
   * Returns the nutrition claim a food may carry for this nutrient, based on the unrounded
   * percentage of the reference intake in 100 g.
   * @param amountPer100g - Amount in this nutrient's unit per 100 g.
   * @returns `high` from 30 %, `source` from 15 %, otherwise `undefined`.
   * @throws InvalidNutrientError when `amountPer100g` is negative or not finite.
   */
  claimLevel(amountPer100g: number): ClaimLevel | undefined {
    if (!(Number.isFinite(amountPer100g) && amountPer100g >= 0)) {
      throw new InvalidNutrientError(`Amount ${amountPer100g} must be a non-negative number.`);
    }
    const percent = (amountPer100g / this.referenceIntake) * PERCENT;
    if (percent >= HIGH_PERCENT) return 'high';
    return percent >= SOURCE_PERCENT ? 'source' : undefined;
  }
}
