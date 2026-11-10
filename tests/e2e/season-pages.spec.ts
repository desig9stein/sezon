import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const MONTH_SLUGS = [
  'yanuari',
  'fevruari',
  'mart',
  'april',
  'may',
  'yuni',
  'yuli',
  'avgust',
  'septemvri',
  'oktomvri',
  'noemvri',
  'dekemvri',
];
const PAGES = ['/', ...MONTH_SLUGS.map((slug) => `/sezon/${slug}`)];

test.describe('season pages', () => {
  for (const path of PAGES) {
    test(`AC11: ${path} has one h1, a canonical URL and valid JSON-LD`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(new RegExp(`${path === '/' ? '/$' : `${path}$`}`));
      const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
      expect(types).toContain('ItemList');
      expect(types).toContain(path === '/' ? 'WebSite' : 'BreadcrumbList');
      const itemList = (await jsonLdOf(page)).find(
        (block) => (block as { '@type': string })['@type'] === 'ItemList',
      ) as { itemListElement: { url: string }[] };
      for (const item of itemList.itemListElement) {
        expect(item.url).toMatch(/^https:\/\//);
      }
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const path of ['/', '/sezon/noemvri', '/sezon/yuli']) {
      test(`AC12: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }
  }

  for (const path of ['/', '/sezon/noemvri']) {
    test(`AC12: ${path} reflows at 320px without horizontal scrolling`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await expectNoAxeViolations(page);
    });
  }

  test('AC12: the skip link is the first focusable element and moves focus to main', async ({
    page,
  }) => {
    await page.goto('/sezon/noemvri');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Към основното съдържание' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});
