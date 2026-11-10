import { frozenList, frozenRecords } from '@shared/domain/freeze';
import type { Month, SeasonCalendar, SeasonLevel } from '@contexts/seasonality';
import type { NutritionFacts } from './NutritionFacts';
import type { ProduceKind } from './ProduceKind';
import type { Source } from './Source';

/** Traditional systems whose uses are described. */
export const TRADITIONAL_SYSTEMS = ['ayurveda', 'folk'] as const;
/** Editorial review states of a produce entry. */
export const REVIEW_STATUSES = ['draft', 'reviewed'] as const;

export type TraditionalSystem = (typeof TRADITIONAL_SYSTEMS)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface Variety {
  readonly name: string;
  readonly note?: string | undefined;
}

export interface GrowingRegion {
  readonly regionSlug: string;
  readonly note: string;
}

export interface PreparationTip {
  readonly method: string;
  readonly tip: string;
}

export interface TraditionalUse {
  readonly system: TraditionalSystem;
  readonly use: string;
  readonly source: Source;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Input for {@link Produce.create}. */
export interface ProduceInput {
  readonly slug: string;
  readonly name: string;
  readonly latinName: string;
  readonly kind: ProduceKind;
  readonly groupSlug: string;
  readonly summary: string;
  readonly varieties: ReadonlyArray<Variety>;
  readonly calendar: SeasonCalendar;
  readonly growingRegions: ReadonlyArray<GrowingRegion>;
  readonly nutrition: NutritionFacts;
  readonly preparation: ReadonlyArray<PreparationTip>;
  readonly traditionalUses: ReadonlyArray<TraditionalUse>;
  readonly howToChoose: string;
  readonly storage: string;
  readonly faq: ReadonlyArray<FaqItem>;
  readonly updatedAt: Date;
  readonly reviewStatus: ReviewStatus;
}

/** A fruit, vegetable, herb or nut grown in Bulgaria, identified by its slug. */
export class Produce {
  readonly slug: string;
  readonly name: string;
  readonly latinName: string;
  readonly kind: ProduceKind;
  readonly groupSlug: string;
  readonly summary: string;
  readonly varieties: ReadonlyArray<Variety>;
  readonly calendar: SeasonCalendar;
  readonly growingRegions: ReadonlyArray<GrowingRegion>;
  readonly nutrition: NutritionFacts;
  readonly preparation: ReadonlyArray<PreparationTip>;
  readonly traditionalUses: ReadonlyArray<TraditionalUse>;
  readonly howToChoose: string;
  readonly storage: string;
  readonly faq: ReadonlyArray<FaqItem>;
  readonly updatedAt: Date;
  readonly reviewStatus: ReviewStatus;

  private constructor(input: ProduceInput) {
    this.slug = input.slug;
    this.name = input.name;
    this.latinName = input.latinName;
    this.kind = input.kind;
    this.groupSlug = input.groupSlug;
    this.summary = input.summary;
    this.varieties = frozenRecords(input.varieties);
    this.calendar = input.calendar;
    this.growingRegions = frozenRecords(input.growingRegions);
    this.nutrition = input.nutrition;
    this.preparation = frozenRecords(input.preparation);
    this.traditionalUses = frozenList(
      input.traditionalUses.map((use) =>
        Object.freeze({ ...use, source: Object.freeze({ ...use.source }) }),
      ),
    );
    this.howToChoose = input.howToChoose;
    this.storage = input.storage;
    this.faq = frozenRecords(input.faq);
    this.updatedAt = new Date(input.updatedAt.getTime());
    this.reviewStatus = input.reviewStatus;
    Object.freeze(this);
  }

  /** Creates a produce entity. */
  static create(input: ProduceInput): Produce {
    return new Produce(input);
  }

  /** Returns the season level in `month`, or `undefined` when out of season. */
  levelIn(month: Month): SeasonLevel | undefined {
    return this.calendar.levelIn(month);
  }

  /** Returns `true` when the produce is harvested fresh in `month`. */
  isFreshIn(month: Month): boolean {
    return this.calendar.isFreshIn(month);
  }

  /** Returns `true` when the produce lists `regionSlug` among its growing regions. */
  isGrownIn(regionSlug: string): boolean {
    return this.growingRegions.some((region) => region.regionSlug === regionSlug);
  }
}
