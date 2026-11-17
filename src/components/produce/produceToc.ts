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

/** How many recipes use a produce and how many farms sell it. */
export interface ProduceCounts {
  readonly recipes: number;
  readonly farms: number;
}

/**
 * Returns the table of contents of a produce page in page order, leaving out each part the page
 * does not render or that would be empty: the cautions without any (spec 055), the eating group
 * without nutrition, preparation, traditional uses or recipes, the growing group without a guide,
 * the farms without a farm (spec 060) and the questions without any.
 * @param counts - Recipes that use the produce and farms that sell it.
 */
export function produceToc(produce: Produce, counts: ProduceCounts): ReadonlyArray<TocEntry> {
  const headings = ui.produce.headings;
  return [
    { id: 'stall', label: headings.stall },
    ...(produce.cautions.length > 0 ? [{ id: 'cautions', label: headings.cautions }] : []),
    ...(hasEatContent(produce, counts.recipes) ? [{ id: 'eat', label: headings.eat }] : []),
    ...(produce.growing === undefined ? [] : [{ id: 'grow', label: headings.grow }]),
    ...(counts.farms > 0 ? [{ id: 'farms', label: headings.farms }] : []),
    ...(produce.faq.length > 0 ? [{ id: 'faq', label: headings.faq }] : []),
    { id: 'sources', label: headings.sources },
  ];
}
