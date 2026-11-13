import type { Produce } from '@contexts/catalog';
import { ui } from '@i18n/bg';

/** One entry of the produce page's table of contents: the target id and its label. */
export interface TocEntry {
  readonly id: string;
  readonly label: string;
}

/**
 * Returns `true` when the produce page has any content for the „На масата“ group: nutrition facts,
 * a preparation tip, a traditional use or a recipe.
 * @param recipeCount - Number of recipes that use the produce.
 */
export function hasEatContent(produce: Produce, recipeCount: number): boolean {
  return (
    produce.nutrition !== undefined ||
    produce.preparation.length > 0 ||
    produce.traditionalUses.length > 0 ||
    recipeCount > 0
  );
}

/**
 * Returns the table of contents of a produce page in page order, leaving out each group the page
 * does not render: the eating group without nutrition, preparation, traditional uses or recipes,
 * the growing group without a guide and the questions without any.
 * @param recipeCount - Number of recipes that use the produce.
 */
export function produceToc(produce: Produce, recipeCount: number): ReadonlyArray<TocEntry> {
  const headings = ui.produce.headings;
  return [
    { id: 'stall', label: headings.stall },
    ...(hasEatContent(produce, recipeCount) ? [{ id: 'eat', label: headings.eat }] : []),
    ...(produce.growing === undefined ? [] : [{ id: 'grow', label: headings.grow }]),
    { id: 'farms', label: headings.farms },
    ...(produce.faq.length > 0 ? [{ id: 'faq', label: headings.faq }] : []),
    { id: 'sources', label: headings.sources },
  ];
}
