import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';
import { expectNoAxeViolations, jsonLdOf } from './a11y';
import { removeAllCss } from './noCss';

const DATA = join(process.cwd(), 'src', 'data');
const yamlOf = (dir: string) =>
  readdirSync(join(DATA, dir))
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => ({
      slug: file.replace(/\.yaml$/, ''),
      data: parse(readFileSync(join(DATA, dir, file), 'utf8')) as Record<string, unknown>,
    }));
const regionSlugs = yamlOf('regions').map(({ slug }) => slug);
const withData = new Set([
  ...yamlOf('produce').flatMap(({ data }) =>
    (data.regions as Array<{ region: string }>).map(({ region }) => region),
  ),
  ...yamlOf('farms').map(({ data }) => data.region as string),
]);

test.describe('region pages (spec 029)', () => {
  test('AC7: pages exist only for regions with data, and the overview lists all 28', async ({
    page,
    request,
  }) => {
    for (const slug of regionSlugs) {
      const response = await request.get(`/regioni/${slug}`);
      expect(response.status(), slug).toBe(withData.has(slug) ? 200 : 404);
    }
    await page.goto('/regioni');
    const items = page.locator('main .regions__list > li');
    await expect(items).toHaveCount(28);
    const hrefs = await page
      .locator('main .regions__list a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(new Set(hrefs)).toEqual(new Set([...withData].map((slug) => `/regioni/${slug}`)));
  });

  test('AC8: the Plovdiv page shows the region, map, produce, farms and structured data', async ({
    page,
  }) => {
    await page.goto('/regioni/plovdiv');
    await expect(page.locator('h1')).toHaveText('Пловдив');
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(
      page.locator('figure.province-map [data-region="plovdiv"][data-marked="true"]'),
    ).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2, name: 'Какво расте тук' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Местни ферми' })).toBeVisible();
    await expect(page.locator('main a[href="/zelenchutsi/zele"]').first()).toBeVisible();
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toEqual(expect.arrayContaining(['AdministrativeArea', 'BreadcrumbList']));
  });

  test('AC9: produce pages and farm cards link to region pages', async ({ page }) => {
    await page.goto('/zelenchutsi/zele');
    await expect(
      page.locator('section:has(> h3#regions) ul a[href="/regioni/plovdiv"]'),
    ).toHaveCount(1);
    await page.goto('/regioni/pleven');
    await expect(page.locator('.farm__meta a[href="/regioni/pleven"]').first()).toBeVisible();
  });

  test('AC10: the catalogue links to the regions and the header marks the catalogue', async ({
    page,
  }) => {
    await page.goto('/katalog');
    await expect(page.locator('main a[href="/regioni"]')).toHaveCount(1);
    await page.goto('/regioni/plovdiv');
    const catalog = page.locator('header nav a', { hasText: 'Каталог' });
    await expect(catalog).toHaveAttribute('aria-current', 'true');
  });

  for (const path of ['/regioni', '/regioni/plovdiv']) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC11: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    test(`AC11: ${path} map links are reachable with Tab and readable without CSS`, async ({
      page,
    }) => {
      await page.goto(path);
      const mapLinks = page.locator('figure.province-map svg a');
      expect(await mapLinks.count()).toBeGreaterThan(0);
      await mapLinks.first().focus();
      await expect(mapLinks.first()).toBeFocused();
      await removeAllCss(page);
      const box = await page.locator('figure.province-map svg').boundingBox();
      expect(box?.width).toBeLessThanOrEqual(320);
    });
  }
});
