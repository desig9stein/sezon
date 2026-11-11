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

test.describe('atlas restyle QA', () => {
  test('QA 013: ribbon and calendar links are named with whole month words', async ({ page }) => {
    await page.goto('/');
    const ribbon = page.getByRole('navigation', { name: 'Месеци', exact: true });
    for (const name of ['Януари', 'Септември', 'Декември', 'Май']) {
      await expect(ribbon.getByRole('link', { name, exact: true })).toHaveCount(1);
    }
    await page.goto('/zelenchutsi/zele');
    await expect(page.getByRole('link', { name: /^Октомври / })).toHaveCount(1);
  });

  test('QA 013: the longest month word stays on one line at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const lines = await page.locator('.hero__month').evaluate((element) => {
      element.textContent = 'септември';
      const range = document.createRange();
      range.selectNodeContents(element);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBe(1);
  });
});
