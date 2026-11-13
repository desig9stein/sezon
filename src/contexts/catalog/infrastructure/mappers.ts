import { Slug } from '@shared/domain/Slug';
import { SeasonCalendar } from '@contexts/seasonality';
import { Nutrient } from '../domain/Nutrient';
import { GrowingGuide } from '../domain/GrowingGuide';
import { NutritionFacts } from '../domain/NutritionFacts';
import { Produce } from '../domain/Produce';
import { ProduceGroup } from '../domain/ProduceGroup';
import type { GroupRecord, NutrientRecord, ProduceRecord } from './schemas';

/**
 * Maps a validated `produce` record to a {@link Produce}.
 * @param id - Content entry id; must be a valid slug.
 * @throws InvalidSlugError | DomainError for invalid values.
 */
export function toProduce(id: string, record: ProduceRecord): Produce {
  const { nutrition } = record;
  return Produce.create({
    slug: Slug.parse(id).value,
    name: record.name,
    latinName: record.latinName,
    kind: record.kind,
    groupSlug: record.group,
    summary: record.summary,
    varieties: record.varieties,
    calendar: SeasonCalendar.from(record.season),
    growingRegions: record.regions.map(({ region, note, source }) => ({
      regionSlug: region,
      note,
      ...(source === undefined ? {} : { source }),
    })),
    nutrition:
      nutrition === undefined
        ? undefined
        : NutritionFacts.create({
            energyKcal: nutrition.energyKcal,
            proteinG: nutrition.proteinG,
            fatG: nutrition.fatG,
            carbohydrateG: nutrition.carbohydrateG,
            fiberG: nutrition.fiberG,
            sugarsG: nutrition.sugarsG,
            micronutrients: nutrition.micronutrients.map(({ nutrient, amount }) => ({
              nutrientSlug: nutrient,
              amount,
            })),
            source: nutrition.source,
          }),
    preparation: record.preparation,
    traditionalUses: record.traditionalUses,
    howToChoose: record.howToChoose,
    storage: record.storage,
    faq: record.faq,
    updatedAt: record.updatedAt,
    photo:
      record.photo === undefined
        ? undefined
        : { image: record.photo.src, alt: record.photo.alt, credit: record.photo.credit },
    growing: record.growing === undefined ? undefined : GrowingGuide.create(record.growing),
    organic: record.organic,
    wild: record.wild,
    cautions: record.cautions,
  });
}

/** Maps a validated `groups` record to a {@link ProduceGroup}. @throws InvalidSlugError */
export function toProduceGroup(id: string, record: GroupRecord): ProduceGroup {
  return ProduceGroup.create({ slug: Slug.parse(id).value, ...record });
}

/** Maps a validated `nutrients` record to a {@link Nutrient}. @throws InvalidSlugError */
export function toNutrient(id: string, record: NutrientRecord): Nutrient {
  return Nutrient.create({
    slug: Slug.parse(id).value,
    name: record.name,
    kind: record.kind,
    unit: record.unit,
    referenceIntake: record.referenceIntake,
    claims: record.claims,
    claimsSource: record.claimsSource,
    note: record.note,
  });
}
