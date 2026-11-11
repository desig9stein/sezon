import type { Produce } from '@contexts/catalog';
import type { ProduceRecord } from '@contexts/catalog/infrastructure/schemas';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { produceRecord } from './records';

/** Options for {@link aProduce}. */
export interface ProduceOptions {
  readonly slug: string;
  readonly name: string;
  readonly kind?: ProduceRecord['kind'];
  readonly season: ProduceRecord['season'];
  readonly micronutrients?: ProduceRecord['nutrition']['micronutrients'];
  readonly photo?: ProduceRecord['photo'];
  readonly group?: ProduceRecord['group'];
}

/** Builds a valid {@link Produce} with the given identity, kind, season, micronutrients, photo and group. */
export function aProduce({
  slug,
  name,
  kind = 'vegetable',
  season,
  micronutrients,
  photo,
  group,
}: ProduceOptions): Produce {
  const base = produceRecord({
    name,
    kind,
    season,
    photo,
    ...(group === undefined ? {} : { group }),
  });
  const nutrition =
    micronutrients === undefined ? base.nutrition : { ...base.nutrition, micronutrients };
  return toProduce(slug, { ...base, nutrition });
}

/** Returns an in-memory produce repository over `items`. */
export function produceRepositoryOf(items: ReadonlyArray<Produce>) {
  return new IndexedRepository(async () => items);
}
