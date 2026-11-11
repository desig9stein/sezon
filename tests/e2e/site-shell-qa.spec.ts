import { expect, test } from '@playwright/test';

test.describe('site shell, QA 023', () => {
  for (const width of [320, 340, 480, 520, 768, 834, 1000]) {
    test(`QA 023: no month label overflows its cell at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      const overflowing = await page
        .locator('footer nav a')
        .evaluateAll((links) =>
          links
            .filter((link) => link.scrollWidth > link.clientWidth)
            .map((link) => link.textContent),
        );
      expect(overflowing).toEqual([]);
    });
  }

  test('QA 023: the skip link focus ring uses the shell focus colour', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/plodove/yabalki');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(
      () => getComputedStyle(document.activeElement as Element).outlineColor,
    );
    expect(outline).toBe('rgb(255, 176, 0)');
  });

  test('QA 023: a focused month in the footer is drawn above its neighbours', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('footer nav a').nth(5);
    await link.focus();
    expect(await link.evaluate((el) => getComputedStyle(el).zIndex)).toBe('1');
  });

  test('QA 023: at 390 px the logo and the four links share one row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const logo = await page.locator('.site-header__logo').boundingBox();
    const tops = await page
      .locator('.site-header__nav a')
      .evaluateAll((links) => links.map((link) => link.getBoundingClientRect().top));
    for (const top of tops) expect(top).toBeLessThan((logo?.y ?? 0) + (logo?.height ?? 0));
  });
});
