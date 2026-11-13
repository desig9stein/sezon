import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const A4_LANDSCAPE_PX = 1123;
const BLACK = 'rgb(0, 0, 0)';
/** The printed calendar may always take two A4 landscape sheets (spec 043). */
const MIN_PRINT_SHEETS_ALLOWED = 2;
/** Produce rows one A4 landscape sheet holds at the readable print spacing (spec 043, spec 053). */
const ROWS_PER_SHEET = 30;

test.describe('calendar page', () => {
  test('AC6: /kalendar has one h1, canonical and BreadcrumbList JSON-LD', async ({ page }) => {
    const response = await page.goto('/kalendar');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/\/kalendar$/);
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toContain('BreadcrumbList');
  });

  test('AC5: the home page links to /kalendar', async ({ page }) => {
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

  test('AC7 (amended by specs 043 and 053): prints on as many A4 landscape sheets as its rows need, without the site chrome', async ({
    page,
  }) => {
    await page.setViewportSize({ width: A4_LANDSCAPE_PX, height: 794 });
    await page.goto('/kalendar');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body > header')).toBeHidden();
    await expect(page.locator('body > footer')).toBeHidden();
    await expect(page.locator('nav.breadcrumbs')).toBeHidden();
    const pdf = await page.pdf({ preferCSSPageSize: true });
    const sheets = pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
    expect(sheets.length).toBeGreaterThanOrEqual(1);
    const rows = await page.locator('.year th[scope="row"]').count();
    const maxSheets = Math.max(MIN_PRINT_SHEETS_ALLOWED, Math.ceil(rows / ROWS_PER_SHEET));
    expect(sheets.length).toBeLessThanOrEqual(maxSheets);
    const rowBreaks = await page
      .locator('.year tbody tr')
      .evaluateAll((elements) => elements.map((row) => getComputedStyle(row).breakInside));
    expect(new Set(rowBreaks)).toEqual(new Set(['avoid']));
  });

  test('QA 043: a printed calendar repeats its month header and keeps each kind heading with its rows', async ({
    page,
  }) => {
    await page.goto('/kalendar');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.year thead')).toHaveCSS('display', 'table-header-group');
    const headingRows = page.locator('.year tbody tr:has(th[scope="rowgroup"])');
    expect(await headingRows.count()).toBeGreaterThan(0);
    const breaks = await headingRows.evaluateAll((rows) =>
      rows.map((row) => getComputedStyle(row).breakAfter),
    );
    expect(new Set(breaks)).toEqual(new Set(['avoid']));
  });

  test('QA 014: prints links and legend in black in dark mode', async ({ page }) => {
    await page.goto('/kalendar');
    await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
    const colours = await page.evaluate(() =>
      [
        document.querySelector('.calendar-legend li'),
        document.querySelector('th[scope="row"] a'),
        document.querySelector('th[scope="rowgroup"] a'),
      ].map((element) => (element ? getComputedStyle(element).color : '')),
    );
    expect(colours).toEqual([BLACK, BLACK, BLACK]);
  });

  test('QA 014: keeps the produce name in view when the table scrolls at 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/kalendar');
    const region = page.getByRole('region', { name: 'Сезон на всеки продукт по месеци' });
    await region.evaluate((element) => element.scrollTo({ left: element.scrollWidth }));
    const [regionBox, headerBox] = await Promise.all([
      region.boundingBox(),
      page.locator('th[scope="row"]').first().boundingBox(),
    ]);
    expect(headerBox?.x).toBeGreaterThanOrEqual((regionBox?.x ?? 0) - 1);
  });
});
