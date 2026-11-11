import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const SLUGS = readdirSync(join(process.cwd(), 'src', 'data', 'nutrients'))
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/, ''));

/** Parses a Bulgarian-formatted amount such as „36,6 мг“ into a number. */
const amountOf = (text: string): number =>
  Number(
    text
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, ''),
  );

test.describe('nutrient pages', () => {
  for (const slug of SLUGS) {
    test(`AC9: /nutrienti/${slug} has one h1, canonical, JSON-LD, claims and a ranked table`, async ({
      page,
    }) => {
      const response = await page.goto(`/nutrienti/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(
        new RegExp(`/nutrienti/${slug}$`),
      );
      const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
      expect(types).toEqual(expect.arrayContaining(['ItemList', 'BreadcrumbList']));
      await expect(page.locator('main a[href*="CELEX:32012R0432"]')).toHaveCount(1);
      const claims = await page
        .locator('section[aria-labelledby="claims"] > ul > li')
        .allTextContents();
      expect(claims.length).toBeGreaterThan(0);
      for (const claim of claims) expect(claim.trim()).toMatch(/[^.]\.$/);
      await expect(page.locator('section[aria-labelledby="claims"]')).toContainText(
        'Важно е храненето да е разнообразно и балансирано',
      );
      const amounts = await page.locator('main table tbody tr td:nth-of-type(1)').allTextContents();
      const numbers = amounts.map(amountOf);
      expect(numbers).toEqual([...numbers].sort((a, b) => b - a));
    });
  }

  test('AC8: a produce nutrition table links to the nutrient page', async ({ page }) => {
    await page.goto('/zelenchutsi/zele');
    await page.getByRole('link', { name: 'Витамин C' }).click();
    await expect(page).toHaveURL(/\/nutrienti\/vitamin-c$/);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC10: /nutrienti/vitamin-c has no axe violations in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/nutrienti/vitamin-c');
      await expectNoAxeViolations(page);
    });
  }

  test('AC10: /nutrienti/kaliy reflows at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/nutrienti/kaliy');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page);
  });
});
