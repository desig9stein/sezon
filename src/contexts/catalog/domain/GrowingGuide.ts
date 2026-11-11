import { InvalidProduceError } from '@shared/domain/errors';
import { frozenList } from '@shared/domain/freeze';
import { Month } from '@contexts/seasonality';
import type { Source } from './Source';

/** Garden activities with a month window. */
export const GROWING_ACTIVITIES = ['sow', 'transplant', 'plant'] as const;
export type GrowingActivity = (typeof GROWING_ACTIVITIES)[number];

/** Input for {@link GrowingGuide.create}: month numbers per activity, note, tips and source. */
export interface GrowingGuideInput {
  readonly sow: ReadonlyArray<number>;
  readonly transplant: ReadonlyArray<number>;
  readonly plant: ReadonlyArray<number>;
  readonly plantingNote?: string | undefined;
  readonly tips: ReadonlyArray<string>;
  readonly source: Source;
}

/** When to sow, transplant and plant a produce in a Bulgarian home garden, with tips. */
export class GrowingGuide {
  readonly sow: ReadonlyArray<Month>;
  readonly transplant: ReadonlyArray<Month>;
  readonly plant: ReadonlyArray<Month>;
  readonly plantingNote: string | undefined;
  readonly tips: ReadonlyArray<string>;
  readonly source: Source;

  private constructor(input: GrowingGuideInput) {
    const months = (numbers: ReadonlyArray<number>) =>
      frozenList([...numbers].sort((a, b) => a - b).map((number) => Month.of(number)));
    this.sow = months(input.sow);
    this.transplant = months(input.transplant);
    this.plant = months(input.plant);
    this.plantingNote = input.plantingNote;
    this.tips = frozenList(input.tips);
    this.source = Object.freeze({ ...input.source });
    Object.freeze(this);
  }

  /**
   * Creates a growing guide.
   * @throws InvalidProduceError when it has no month and no planting note.
   * @throws InvalidMonthError when a month number is not 1–12.
   */
  static create(input: GrowingGuideInput): GrowingGuide {
    const monthCount = input.sow.length + input.transplant.length + input.plant.length;
    if (monthCount === 0 && (input.plantingNote ?? '').trim() === '') {
      throw new InvalidProduceError('A growing guide needs a month or a planting note.');
    }
    return new GrowingGuide(input);
  }

  /** Returns the months of `activity`, in calendar order. */
  monthsOf(activity: GrowingActivity): ReadonlyArray<Month> {
    return this[activity];
  }

  /** Returns the activities due in `month`, in the order sow, transplant, plant. */
  activitiesIn(month: Month): ReadonlyArray<GrowingActivity> {
    return GROWING_ACTIVITIES.filter((activity) => this[activity].includes(month));
  }
}
