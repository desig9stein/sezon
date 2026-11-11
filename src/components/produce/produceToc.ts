import type { Produce } from '@contexts/catalog';
import { ui } from '@i18n/bg';

/** One entry of the produce page's table of contents: the target id and its label. */
export interface TocEntry {
  readonly id: string;
  readonly label: string;
}

/**
 * Returns the table of contents of a produce page in page order, leaving out the growing group
 * when the produce has no guide and the questions when it has none.
 */
export function produceToc(produce: Produce): ReadonlyArray<TocEntry> {
  const headings = ui.produce.headings;
  return [
    { id: 'stall', label: headings.stall },
    { id: 'eat', label: headings.eat },
    ...(produce.growing === undefined ? [] : [{ id: 'grow', label: headings.grow }]),
    { id: 'farms', label: headings.farms },
    ...(produce.faq.length > 0 ? [{ id: 'faq', label: headings.faq }] : []),
    { id: 'sources', label: headings.sources },
  ];
}
