import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/plodove', '/zelenchutsi', '/podpravki', '/grupi/sennikotsvetni'];
const WIDTHS = [320, 390, 768];
const LONG_NAME = 'Брюкселско зеле (кълнове) от планината';
const ROWS = 'article[data-variant="index"]';

/** Returns descriptions of intersecting text boxes inside index rows on the current page. */
const overlapsInIndexRows = (page: Page) =>
  page.evaluate((rows) => {
    const tolerance = 0.5;
    const found: string[] = [];
    for (const row of document.querySelectorAll(rows)) {
      const boxes = [
        row.querySelector('.produce-card__name a'),
        ...row.querySelectorAll('.produce-card__meta > *'),
      ]
        .filter((element): element is Element => element !== null)
        .map((element) => ({
          text: element.textContent?.trim() ?? '',
          rect: element.getBoundingClientRect(),
        }));
      boxes.forEach((a, index) =>
        boxes.slice(index + 1).forEach((b) => {
          const width = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
          const height = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
          if (width > tolerance && height > tolerance) found.push(`${a.text} × ${b.text}`);
        }),
      );
    }
    return found;
  }, ROWS);

const open = async (page: Page, path: string, width: number) => {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(ROWS).first()).toBeVisible();
};

test.describe('index rows', () => {
  for (const width of WIDTHS) {
    for (const path of PAGES) {
      test(`AC1: no text overlaps in index rows on ${path} at ${width}px`, async ({ page }) => {
        await open(page, path, width);
        expect(await overlapsInIndexRows(page)).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }

    test(`AC2: a long produce name does not overlap its row at ${width}px`, async ({ page }) => {
      await open(page, '/zelenchutsi', width);
      await page
        .locator(`${ROWS} .produce-card__name a`)
        .first()
        .evaluate((link, name) => {
          link.textContent = name;
        }, LONG_NAME);
      expect(await overlapsInIndexRows(page)).toEqual([]);
    });
  }
});
