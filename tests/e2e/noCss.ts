import { expect, type Page } from '@playwright/test';

/**
 * Removes every style sheet, `<style>` element, adopted style sheet and `style` attribute from the
 * loaded page, then asserts that no author style sheet is left.
 */
export async function removeAllCss(page: Page): Promise<void> {
  const remaining = await page.evaluate(() => {
    for (const node of document.querySelectorAll('link[rel~="stylesheet"], style')) node.remove();
    for (const element of document.querySelectorAll('[style]')) element.removeAttribute('style');
    document.adoptedStyleSheets = [];
    return document.styleSheets.length + document.adoptedStyleSheets.length;
  });
  expect(remaining).toBe(0);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
}

/**
 * Returns a short description (tag and classes) of each element in `<body>` that CSS hides:
 * `display: none`, `visibility: hidden | collapse`, `opacity: 0`, `content-visibility: hidden`,
 * a `clip-path`, a zero-size box that clips its content, or a box outside the document
 * or, inside a scroll container (other than `html` and `body`), outside its scrollable area.
 * `[hidden]` elements that CSS reveals are reported with the suffix ` (revealed)`.
 * Non-rendered elements, `[hidden]`, `.visually-hidden`, `.visually-hidden-inline`, `.skip-link` and
 * their descendants are exempt.
 */
export async function hiddenByCss(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const exempt =
      'script, style, template, noscript, [hidden], .visually-hidden, .visually-hidden-inline, .skip-link';
    const describe = (element: Element): string =>
      `${element.tagName.toLowerCase()}${[...element.classList].map((name) => `.${name}`).join('')}`;
    const documentWidth = document.documentElement.scrollWidth;
    const documentHeight = document.documentElement.scrollHeight;

    const scrolls = (value: string): boolean => value === 'auto' || value === 'scroll';
    const scrollContainerOf = (element: Element): Element | undefined => {
      for (
        let parent = element.parentElement;
        parent !== null && parent !== document.body && parent !== document.documentElement;
        parent = parent.parentElement
      ) {
        const style = getComputedStyle(parent);
        if (scrolls(style.overflowX) || scrolls(style.overflowY)) return parent;
      }
      return undefined;
    };
    const reachableInContainer = (box: DOMRect, container: Element): boolean => {
      const frame = container.getBoundingClientRect();
      const left = frame.left - container.scrollLeft;
      const top = frame.top - container.scrollTop;
      return (
        box.right > left &&
        box.bottom > top &&
        box.left < left + container.scrollWidth &&
        box.top < top + container.scrollHeight
      );
    };

    const isHidden = (element: Element): boolean => {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility !== 'visible') return true;
      if (Number(style.opacity) === 0 || style.contentVisibility === 'hidden') return true;
      if (style.clipPath !== 'none') return true;
      const box = element.getBoundingClientRect();
      const clipsContent = style.overflow !== 'visible' && element.textContent?.trim() !== '';
      if (clipsContent && (box.width === 0 || box.height === 0)) return true;
      const container = scrollContainerOf(element);
      if (container !== undefined) return box.width > 0 && !reachableInContainer(box, container);
      const left = box.left + window.scrollX;
      const top = box.top + window.scrollY;
      return (
        box.width > 0 &&
        (left + box.width <= 0 ||
          top + box.height <= 0 ||
          left >= documentWidth ||
          top >= documentHeight)
      );
    };

    const hidden = [...document.body.querySelectorAll('*')]
      .filter((element) => element.closest(exempt) === null)
      .filter(isHidden)
      .map(describe);
    const revealed = [...document.body.querySelectorAll('[hidden]')]
      .filter((element) => getComputedStyle(element).display !== 'none')
      .map((element) => `${describe(element)} (revealed)`);
    return [...hidden, ...revealed];
  });
}

/**
 * Returns a short description of each element whose CSS changes the visual order of content:
 * a non-zero `order`, a reversed flex direction, `wrap-reverse`, a `dense` grid auto-flow,
 * `direction: rtl`, or a right float on an element that has element siblings.
 */
export async function reorderedByCss(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const describe = (element: Element, reason: string): string =>
      `${element.tagName.toLowerCase()}${[...element.classList].map((name) => `.${name}`).join('')} (${reason})`;
    return [...document.body.querySelectorAll('*')].flatMap((element) => {
      const style = getComputedStyle(element);
      const hasSiblings = (element.parentElement?.children.length ?? 0) > 1;
      const floatsRight = style.float === 'right' || style.float === 'inline-end';
      const reasons = [
        style.order !== '0' ? `order: ${style.order}` : '',
        style.flexDirection.endsWith('reverse') ? `flex-direction: ${style.flexDirection}` : '',
        style.flexWrap === 'wrap-reverse' ? 'flex-wrap: wrap-reverse' : '',
        style.gridAutoFlow.includes('dense') ? `grid-auto-flow: ${style.gridAutoFlow}` : '',
        style.direction === 'rtl' ? 'direction: rtl' : '',
        floatsRight && hasSiblings ? `float: ${style.float}` : '',
      ].filter((reason) => reason !== '');
      return reasons.map((reason) => describe(element, reason));
    });
  });
}
