import { DuplicateEntityError } from '@shared/domain/errors';
import type { NamedEntity, Repository } from '@shared/domain/Repository';
import { cachedLoad } from './cachedLoad';

const bulgarianCollator = new Intl.Collator('bg');

interface EntityIndex<T> {
  readonly sorted: ReadonlyArray<T>;
  readonly bySlug: ReadonlyMap<string, T>;
}

/**
 * Repository over an asynchronously loaded list of entities. A successful load is cached;
 * a failed load is retried on the next call. Entities are indexed by slug and sorted by
 * Bulgarian name, then by slug.
 */
export class IndexedRepository<T extends NamedEntity> implements Repository<T> {
  private readonly getIndex: () => Promise<EntityIndex<T>>;

  /** @param load - Returns the entities. */
  constructor(load: () => Promise<ReadonlyArray<T>>) {
    this.getIndex = cachedLoad(async () => buildIndex(await load()));
  }

  /** Returns every entity, sorted by Bulgarian name. @throws DuplicateEntityError */
  async all(): Promise<ReadonlyArray<T>> {
    return (await this.getIndex()).sorted;
  }

  /** Returns the entity with `slug`, or `undefined`. @throws DuplicateEntityError */
  async findBySlug(slug: string): Promise<T | undefined> {
    return (await this.getIndex()).bySlug.get(slug);
  }
}

function buildIndex<T extends NamedEntity>(items: ReadonlyArray<T>): EntityIndex<T> {
  const bySlug = new Map<string, T>();
  for (const item of items) {
    if (bySlug.has(item.slug)) {
      throw new DuplicateEntityError(`Duplicate slug "${item.slug}".`);
    }
    bySlug.set(item.slug, item);
  }
  const sorted = Object.freeze(
    [...items].sort(
      (a, b) => bulgarianCollator.compare(a.name, b.name) || a.slug.localeCompare(b.slug),
    ),
  );
  return { sorted, bySlug };
}
