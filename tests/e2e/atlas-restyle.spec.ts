import { expect, test } from '@playwright/test';

test.describe('atlas restyle', () => {
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
  test('QA 013: the longest month word stays on one line at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const lines = await page.locator('.home-heading__month').evaluate((element) => {
      element.textContent = 'септември';
      const range = document.createRange();
      range.selectNodeContents(element);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBe(1);
  });
});
