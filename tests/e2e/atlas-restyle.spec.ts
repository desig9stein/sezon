import { expect, test } from '@playwright/test';

test.describe('atlas restyle', () => {
  test('AC3: the home page opens with the plate label, the month heading, the intro and the ribbon', async ({
    page,
  }) => {
    await page.goto('/');
    const order = await page.evaluate(() => {
      const main = document.querySelector('main');
      const pick = (selector: string) => main?.querySelector(selector) ?? null;
      const items = [
        pick('.hero__plate'),
        pick('h1'),
        pick('.hero__intro'),
        pick('nav[aria-label="Месеци"]'),
      ];
      if (items.some((item) => item === null)) return false;
      return items.every((item, index) => {
        const next = items[index + 1];
        return (
          next === undefined ||
          next === null ||
          item === null ||
          (item.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
        );
      });
    });
    expect(order).toBe(true);
    await expect(page.locator('h1 .hero__month')).toHaveCount(1);
  });

  test('AC8: at 320px the header stays compact and nothing scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ['/', '/zelenchutsi/zele']) {
      await page.goto(path);
      const header = await page.locator('body > header').boundingBox();
      expect(header?.height ?? Infinity).toBeLessThanOrEqual(180);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});
