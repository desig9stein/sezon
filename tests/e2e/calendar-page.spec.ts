import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const A4_LANDSCAPE_PX = 1123;

test.describe('calendar page', () => {
  test('AC6: /kalendar has one h1, canonical and BreadcrumbList JSON-LD', async ({ page }) => {
    const response = await page.goto('/kalendar');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/\/kalendar$/);
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toContain('BreadcrumbList');
    await page.goto('/');
    await expect(page.locator('main a[href="/kalendar"]')).toHaveCount(1);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC6: /kalendar has no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/kalendar');
      await expectNoAxeViolations(page);
    });
  }

  test('AC6: /kalendar reflows at 320px with the table scrolling in its region', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/kalendar');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page);
  });

  test('AC7: prints on A4 landscape without the site chrome', async ({ page }) => {
    await page.setViewportSize({ width: A4_LANDSCAPE_PX, height: 794 });
    await page.goto('/kalendar');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body > header')).toBeHidden();
    await expect(page.locator('body > footer')).toBeHidden();
    const tableWidth = await page.locator('table').evaluate((table) => table.scrollWidth);
    expect(tableWidth).toBeLessThanOrEqual(A4_LANDSCAPE_PX);
  });
});
