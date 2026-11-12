import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const FARM_SLUGS = readdirSync(join(process.cwd(), 'src', 'data', 'farms'))
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/, ''));

test.describe('farm pages (spec 030)', () => {
  test('AC8: the farm list links to a page for every farm', async ({ page, request }) => {
    await page.goto('/fermi');
    const hrefs = await page
      .locator('main .farm__name a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(new Set(hrefs)).toEqual(new Set(FARM_SLUGS.map((slug) => `/fermi/${slug}`)));
    for (const slug of FARM_SLUGS) {
      expect((await request.get(`/fermi/${slug}`)).status(), slug).toBe(200);
    }
  });

  test('AC9: the Венец page shows region, produce, contacts, address and sources', async ({
    page,
  }) => {
    await page.goto('/fermi/venets');
    await expect(page.locator('h1')).toHaveText('Венец');
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('main a[href="/regioni/pleven"]')).toHaveCount(1);
    const produce = page.locator('section:has(> h2#farm-produce) li');
    await expect(produce).toHaveCount(3);
    for (const item of await produce.all()) {
      await expect(item.locator('a')).toHaveCount(1);
      await expect(item.locator('.season-stamp, .farm-produce__out')).toHaveCount(1);
    }
    await expect(page.locator('main a[href="https://venets.co/"]').first()).toBeVisible();
    await expect(page.locator('main a[href="mailto:info@venets.co"]')).toHaveCount(1);
    await expect(page.locator('main')).toContainText('с. Тодорово');
    expect(await page.locator('section:has(> h2#farm-sources) li').count()).toBe(4);
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toEqual(expect.arrayContaining(['LocalBusiness', 'BreadcrumbList']));
  });

  test('AC10: produce pages and the catalogue link to farm pages', async ({ page }) => {
    await page.goto('/plodove/yabalki');
    await expect(
      page
        .locator(
          '#farms ~ * .farm__name a[href="/fermi/venets"], .farm__name a[href="/fermi/venets"]',
        )
        .first(),
    ).toBeVisible();
    await page.goto('/katalog');
    await expect(page.locator('main a[href="/fermi"]')).toHaveCount(1);
    await page.goto('/fermi/venets');
    await expect(page.locator('header nav a', { hasText: 'Каталог' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  for (const path of ['/fermi', '/fermi/venets']) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC11: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    test(`AC11: ${path} does not scroll sideways at 320 px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
