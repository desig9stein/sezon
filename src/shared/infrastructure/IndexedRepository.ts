import { DuplicateEntityError } from '@shared/domain/errors';
import type { NamedEntity, Repository } from '@shared/domain/Repository';

const BULGARIAN_LOCALE = 'bg';

interface EntityIndex<T> {
  readonly sorted: ReadonlyArray<T>;
  readonly bySlug: ReadonlyMap<string, T>;
}

/**
 * Repository over an asynchronously loaded list of entities. The loader runs once;
 * the result is indexed by slug and sorted by Bulgarian name.
 */
export class IndexedRepository<T extends NamedEntity> implements Repository<T> {
  private index: Promise<EntityIndex<T>> | undefined;

  /** @param load - Returns the entities. Called at most once. */
  constructor(private readonly load: () => Promise<ReadonlyArray<T>>) {}

  /** Returns every entity, sorted by Bulgarian name. @throws DuplicateEntityError */
  async all(): Promise<ReadonlyArray<T>> {
    return (await this.getIndex()).sorted;
  }

  /** Returns the entity with `slug`, or `undefined`. @throws DuplicateEntityError */
  async findBySlug(slug: string): Promise<T | undefined> {
    return (await this.getIndex()).bySlug.get(slug);
  }

  private getIndex(): Promise<EntityIndex<T>> {
    this.index ??= this.load().then(buildIndex);
    return this.index;
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
    [...items].sort((a, b) => a.name.localeCompare(b.name, BULGARIAN_LOCALE)),
  );
  return { sorted, bySlug };
}
