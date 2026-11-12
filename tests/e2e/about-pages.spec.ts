import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';
import { removeAllCss } from './noCss';

const ABOUT_SECTIONS = 10;
const METHODOLOGY_SECTIONS = 8;
const FORM = 'https://github.com/desig9stein/sezon/issues/new';

test.describe('about and methodology (spec 031)', () => {
  test('AC5: the about page has its sections, links and no invented email', async ({ page }) => {
    await page.goto('/za-nas');
    await expect(page.locator('main h2')).toHaveCount(ABOUT_SECTIONS);
    await expect(page.locator('main #greshka')).toHaveCount(1);
    await expect(page.locator('main #dobavi-ferma')).toHaveCount(1);
    await expect(
      page.locator('main a[href="https://github.com/desig9stein"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('main a[href="https://github.com/desig9stein/sezon"]').first(),
    ).toBeVisible();
    await expect(page.locator('main a[href="/metodologiya"]').first()).toBeVisible();
    await expect(page.locator(`main a[href^="${FORM}"]`).first()).toBeVisible();
    await expect(page.locator('main')).toContainText('MIT');
    await expect(page.locator('main')).toContainText('CC BY 4.0');
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  });

  test('AC6: the methodology names its sources and links to corrections', async ({ page }) => {
    await page.goto('/metodologiya');
    await expect(page.locator('main h2')).toHaveCount(METHODOLOGY_SECTIONS);
    await expect(page.locator('main a[href^="https://fdc.nal.usda.gov"]').first()).toBeVisible();
    await expect(page.locator('main a[href*="efsa.europa.eu"]').first()).toBeVisible();
    await expect(page.locator('main a[href="/za-nas#greshka"]').first()).toBeVisible();
  });

  for (const path of ['/', '/plodove/yabalki', '/regioni/plovdiv']) {
    test(`AC7: the footer of ${path} links about, methodology and a report for that page`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer.locator('a[href="/za-nas"]')).toHaveCount(1);
      await expect(footer.locator('a[href="/metodologiya"]')).toHaveCount(1);
      const report = footer.locator(`a[href^="${FORM}"]`);
      await expect(report).toHaveCount(1);
      const href = (await report.getAttribute('href')) ?? '';
      const reported = new URL(href).searchParams.get('page') ?? '';
      expect(new URL(reported).pathname).toBe(new URL(path, baseURL).pathname);
    });
  }

  test('AC8: produce sources link to the methodology', async ({ page }) => {
    await page.goto('/plodove/yabalki');
    await expect(page.locator('section:has(> h2#sources) a[href="/metodologiya"]')).toHaveCount(1);
  });

  test('AC9: structured data and titles', async ({ page }) => {
    for (const [path, type] of [
      ['/za-nas', 'AboutPage'],
      ['/metodologiya', 'WebPage'],
    ] as const) {
      await page.goto(path);
      const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
      expect(types).toEqual(expect.arrayContaining([type, 'BreadcrumbList']));
      expect([...(await page.title())].length).toBeLessThanOrEqual(60);
    }
  });

  for (const path of ['/za-nas', '/metodologiya']) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC11: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    test(`AC11: ${path} fits 320 px and reads in order without CSS`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await removeAllCss(page);
      const order = await page.evaluate(() =>
        [...document.querySelectorAll('main h1, main h2')].map((heading) => heading.tagName),
      );
      expect(order[0]).toBe('H1');
      expect(order.slice(1).every((tag) => tag === 'H2')).toBe(true);
    });
  }
});
