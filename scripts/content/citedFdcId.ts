const FDC_ID = /\/food-details\/(\d+)\//;
const USDA_HOST = 'fdc.nal.usda.gov';

/** The part of a raw produce YAML record the USDA extract reads; nutrition is optional (spec 049). */
export interface ProduceNutritionSource {
  readonly nutrition?: { readonly source: { readonly url: string } } | undefined;
  readonly [key: string]: unknown;
}

/**
 * Returns the FoodData Central id cited by a produce's nutrition source.
 * @param record - Raw produce YAML record.
 * @param file - File name of the record, used in the error message.
 * @returns The FDC id, or `undefined` when the produce has no nutrition or cites a non-USDA source.
 * @throws Error when a USDA source is not an FDC item URL.
 */
export function citedFdcId(record: ProduceNutritionSource, file: string): string | undefined {
  const url = record.nutrition?.source.url;
  if (url === undefined || new URL(url).hostname !== USDA_HOST) return undefined;
  const id = FDC_ID.exec(url)?.[1];
  if (id === undefined) throw new Error(`${file}: the nutrition source is not an FDC item URL`);
  return id;
}
