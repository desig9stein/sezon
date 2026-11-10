/** An entity identified by a slug and displayed by a Bulgarian name. */
export interface NamedEntity {
  readonly slug: string;
  readonly name: string;
}

/** Read access to a collection of named entities. */
export interface Repository<T extends NamedEntity> {
  /** Returns every entity, sorted by Bulgarian name. */
  all(): Promise<ReadonlyArray<T>>;
  /** Returns the entity with `slug`, or `undefined` when none exists. */
  findBySlug(slug: string): Promise<T | undefined>;
}
