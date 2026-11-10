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
}

/** Builds a valid {@link Produce} with the given identity, kind and season. */
export function aProduce({ slug, name, kind = 'vegetable', season }: ProduceOptions): Produce {
  return toProduce(slug, produceRecord({ name, kind, season }));
}

/** Returns an in-memory produce repository over `items`. */
export function produceRepositoryOf(items: ReadonlyArray<Produce>) {
  return new IndexedRepository(async () => items);
}
