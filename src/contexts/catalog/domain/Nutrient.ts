/** Nutrient kinds as stored in content. */
export const NUTRIENT_KINDS = ['vitamin', 'mineral'] as const;
/** Units in which nutrient amounts are expressed. */
export const NUTRIENT_UNITS = ['mg', 'µg'] as const;

export type NutrientKind = (typeof NUTRIENT_KINDS)[number];
export type NutrientUnit = (typeof NUTRIENT_UNITS)[number];

const PERCENT = 100;

/** Input for {@link Nutrient.create}. */
export interface NutrientInput {
  readonly slug: string;
  readonly name: string;
  readonly kind: NutrientKind;
  readonly unit: NutrientUnit;
  readonly referenceIntake: number;
  readonly description: string;
}

/** A vitamin or mineral with its EU adult reference intake (NRV). */
export class Nutrient {
  readonly slug: string;
  readonly name: string;
  readonly kind: NutrientKind;
  readonly unit: NutrientUnit;
  readonly referenceIntake: number;
  readonly description: string;

  private constructor(input: NutrientInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.kind = input.kind;
    this.unit = input.unit;
    this.referenceIntake = input.referenceIntake;
    this.description = input.description;
    Object.freeze(this);
  }

  /** Creates a nutrient. */
  static create(input: NutrientInput): Nutrient {
    return new Nutrient(input);
  }

  /** Returns `amount` as a percentage of the reference intake, rounded to an integer. */
  percentOfReferenceIntake(amount: number): number {
    return Math.round((amount / this.referenceIntake) * PERCENT);
  }
}
