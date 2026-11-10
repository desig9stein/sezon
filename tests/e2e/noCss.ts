import type { Page } from '@playwright/test';

/** Removes every style sheet, `<style>` element and `style` attribute from the loaded page. */
export async function removeAllCss(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll('link[rel~="stylesheet"], style')) node.remove();
    for (const element of document.querySelectorAll('[style]')) element.removeAttribute('style');
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
}

/**
 * Returns a short description (tag, id, classes) of each element in `<body>` that CSS hides with
 * `display: none` or `visibility: hidden`, excluding non-rendered elements, `[hidden]`,
 * `.visually-hidden` and their descendants.
 */
export async function hiddenByCss(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const exempt = 'script, style, template, noscript, [hidden], .visually-hidden';
    const describe = (element: Element): string =>
      `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList]
        .map((name) => `.${name}`)
        .join('')}`;
    return [...document.body.querySelectorAll('*')]
      .filter((element) => element.closest(exempt) === null)
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.display === 'none' || style.visibility === 'hidden';
      })
      .map(describe);
  });
}

/**
 * Returns a short description of each element whose CSS changes the visual order of content:
 * a non-zero `order`, a reversed flex direction, `wrap-reverse` or a `dense` grid auto-flow.
 */
export async function reorderedByCss(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const describe = (element: Element, reason: string): string =>
      `${element.tagName.toLowerCase()}${[...element.classList].map((name) => `.${name}`).join('')} (${reason})`;
    return [...document.body.querySelectorAll('*')].flatMap((element) => {
      const style = getComputedStyle(element);
      const reasons = [
        style.order !== '0' ? `order: ${style.order}` : '',
        style.flexDirection.endsWith('reverse') ? `flex-direction: ${style.flexDirection}` : '',
        style.flexWrap === 'wrap-reverse' ? 'flex-wrap: wrap-reverse' : '',
        style.gridAutoFlow.includes('dense') ? `grid-auto-flow: ${style.gridAutoFlow}` : '',
      ].filter((reason) => reason !== '');
      return reasons.map((reason) => describe(element, reason));
    });
  });
}
