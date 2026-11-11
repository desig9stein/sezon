import { expect, test } from '@playwright/test';

const PAGES = ['/sezon/noemvri', '/plodove', '/zelenchutsi', '/grupi/krastotsvetni'];
const WIDTHS = [320, 390];
const TOLERANCE_PX = 0.5;

/** Returns descriptions of intersecting text boxes inside index rows on the current page. */
const overlapsInIndexRows = () =>
  `(() => {
    const boxes = (row) =>
      [row.querySelector('.produce-card__name a'), ...row.querySelectorAll('.produce-card__meta > *')]
        .filter(Boolean)
        .map((el) => ({ text: el.textContent.trim(), rect: el.getBoundingClientRect() }));
    const hit = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > ${TOLERANCE_PX} &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > ${TOLERANCE_PX};
    const found = [];
    for (const row of document.querySelectorAll('[data-variant="index"]')) {
      const list = boxes(row);
      list.forEach((a, i) =>
        list.slice(i + 1).forEach((b) => { if (hit(a.rect, b.rect)) found.push(a.text + ' × ' + b.text); }),
      );
    }
    return found;
  })()`;

test.describe('index rows', () => {
  for (const width of WIDTHS) {
    for (const path of PAGES) {
      test(`AC1: no text overlaps in index rows on ${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const overlaps = await page.evaluate<string[]>(overlapsInIndexRows());
        expect(overlaps).toEqual([]);
      });
    }
  }
});
