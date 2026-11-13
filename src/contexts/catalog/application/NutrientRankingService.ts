import type { Month, SeasonLevel } from '@contexts/seasonality';
import { NutrientNotFoundError } from '@shared/domain/errors';
import type { ClaimLevel, Nutrient } from '../domain/Nutrient';
import type { Produce } from '../domain/Produce';
import type { NutrientRepository, ProduceRepository } from '../domain/repositories';

/** One produce in a nutrient ranking. */
export interface NutrientRankingEntry {
  readonly produce: Produce;
  readonly amount: number;
  readonly percentOfReferenceIntake: number;
  readonly claimLevel: ClaimLevel | undefined;
  readonly seasonLevel: SeasonLevel | undefined;
}

/** Produce that contains one nutrient, ranked by amount per 100 g. */
export interface NutrientRanking {
  readonly nutrient: Nutrient;
  readonly month: Month;
  readonly entries: ReadonlyArray<NutrientRankingEntry>;
  /** Entries that are fresh in `month` and carry a claim level. */
  readonly inSeason: ReadonlyArray<NutrientRankingEntry>;
}

/** Ranks produce by the amount of a vitamin or mineral. */
export class NutrientRankingService {
  constructor(
    private readonly produce: ProduceRepository,
    private readonly nutrients: NutrientRepository,
  ) {}

  /** Returns every nutrient in repository order. */
  allNutrients(): Promise<ReadonlyArray<Nutrient>> {
    return this.nutrients.all();
  }

  /**
   * Ranks the produce that lists the nutrient, highest amount first; equal amounts keep the
   * repository order. Produce without nutrition facts are left out. Season levels refer to `month`.
   * @throws NutrientNotFoundError when no nutrient has `slug`.
   */
  async rankingFor(slug: string, month: Month): Promise<NutrientRanking> {
    const nutrient = (await this.nutrients.all()).find((item) => item.slug === slug);
    if (nutrient === undefined) {
      throw new NutrientNotFoundError(`No nutrient with slug "${slug}".`);
    }
    const entries = (await this.produce.all())
      .flatMap((produce): NutrientRankingEntry[] => {
        const amount = produce.nutrition?.micronutrients.find(
          (micronutrient) => micronutrient.nutrientSlug === slug,
        )?.amount;
        if (amount === undefined) return [];
        return [
          Object.freeze({
            produce,
            amount,
            percentOfReferenceIntake: nutrient.percentOfReferenceIntake(amount),
            claimLevel: nutrient.claimLevel(amount),
            seasonLevel: produce.levelIn(month),
          }),
        ];
      })
      .sort((a, b) => b.amount - a.amount);
    const inSeason = entries.filter(
      (entry) => entry.claimLevel !== undefined && entry.produce.isFreshIn(month),
    );
    return Object.freeze({
      nutrient,
      month,
      entries: Object.freeze(entries),
      inSeason: Object.freeze(inSeason),
    });
  }
}
