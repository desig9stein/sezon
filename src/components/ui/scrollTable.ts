/** Pixels a table may exceed its box by without counting as overflowing (sub-pixel rounding). */
const OVERFLOW_TOLERANCE = 1;
const NAME_ATTRIBUTE = 'aria-label';
/** Attribute that keeps the region's name while the region is not focusable. */
const STORED_NAME_ATTRIBUTE = 'data-scroll-label';

/**
 * Makes a scroll region a named Tab stop only while its content overflows it (spec 062): a table
 * that fits needs no keyboard scrolling and no landmark.
 * @param region - The `ScrollTable` element, rendered focusable and named.
 */
export function updateScrollTable(region: HTMLElement): void {
  const overflows = region.scrollWidth > region.clientWidth + OVERFLOW_TOLERANCE;
  const name = region.getAttribute(NAME_ATTRIBUTE) ?? region.getAttribute(STORED_NAME_ATTRIBUTE);
  if (name !== null) region.setAttribute(STORED_NAME_ATTRIBUTE, name);
  if (overflows) {
    region.setAttribute('tabindex', '0');
    if (name !== null) region.setAttribute(NAME_ATTRIBUTE, name);
    return;
  }
  region.removeAttribute('tabindex');
  region.removeAttribute(NAME_ATTRIBUTE);
}

/**
 * Updates every scroll region now and whenever its size or the size of its table changes.
 * @param regions - The `ScrollTable` elements of the page.
 */
export function watchScrollTables(regions: Iterable<HTMLElement>): void {
  const owners = new Map<Element, HTMLElement>();
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const region = owners.get(entry.target);
      if (region !== undefined) updateScrollTable(region);
    }
  });
  for (const region of regions) {
    updateScrollTable(region);
    for (const target of [region, ...region.children]) {
      owners.set(target, region);
      observer.observe(target);
    }
  }
}
