/**
 * Readers of raw produce YAML records for tests that parse `src/data/produce` without the schema.
 * Every field they read is optional (spec 049), so a minimal produce never crashes a test file.
 */

/** The optional parts of a raw produce YAML record these readers use. */
export interface RawProduce {
  readonly regions?:
    ReadonlyArray<{ readonly region: string; readonly [key: string]: unknown }> | undefined;
  readonly nutrition?: { readonly source: { readonly url: string } } | undefined;
  readonly [key: string]: unknown;
}

/** Returns the ids of the regions a raw produce record lists; empty when it lists none. */
export function regionSlugsOf(record: RawProduce): string[] {
  return (record.regions ?? []).map(({ region }) => region);
}

/** Returns the URL of a raw produce record's nutrition source, or `undefined` without nutrition. */
export function nutritionSourceUrl(record: RawProduce): string | undefined {
  return record.nutrition?.source.url;
}
