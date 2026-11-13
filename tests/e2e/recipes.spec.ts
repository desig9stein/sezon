import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const RECIPES_DIR = join(process.cwd(), 'src', 'data', 'recipes');
const RECIPE_SLUGS = readdirSync(RECIPES_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/, ''));
const SAUERKRAUT = parse(readFileSync(join(RECIPES_DIR, 'kiselo-zele.yaml'), 'utf8')) as {
  steps: string[];
  ingredients: unknown[];
};

test.describe('recipes (spec 048)', () => {
  test('AC11: the index links every recipe under a category heading', async ({ page, request }) => {
    await page.goto('/retsepti');
    await expect(page.locator('h1')).toHaveText('Рецепти за зимнина');
    const hrefs = await page
      .locator('main section:has(> h2) li a[href^="/retsepti/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(new Set(hrefs)).toEqual(new Set(RECIPE_SLUGS.map((slug) => `/retsepti/${slug}`)));
    for (const slug of RECIPE_SLUGS) {
      expect((await request.get(`/retsepti/${slug}`)).status(), slug).toBe(200);
    }
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toEqual(expect.arrayContaining(['CollectionPage', 'BreadcrumbList']));
  });

  test('AC12: the sauerkraut page shows ingredients, steps, safety and produce', async ({
    page,
  }) => {
    await page.goto('/retsepti/kiselo-zele');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Кисело зеле');
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('section:has(> h2#ingredients) ul > li')).toHaveCount(
      SAUERKRAUT.ingredients.length,
    );
    await expect(page.locator('section:has(> h2#steps) ol > li')).toHaveCount(
      SAUERKRAUT.steps.length,
    );
    expect(
      await page.locator('section:has(> h2#safety) a[href^="https://"]').count(),
    ).toBeGreaterThan(0);
    await expect(page.locator('main a[href="/zelenchutsi/zele"]').first()).toBeVisible();
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toEqual(expect.arrayContaining(['Recipe', 'BreadcrumbList']));
  });

  test('AC13: the cabbage page links its recipe; dill has no recipe block', async ({ page }) => {
    await page.goto('/zelenchutsi/zele');
    await expect(
      page.locator('section:has(> h3#recipes) a[href="/retsepti/kiselo-zele"]'),
    ).toHaveCount(1);
    await page.goto('/podpravki/kopar');
    await expect(page.locator('#recipes')).toHaveCount(0);
  });

  test('AC14: the catalogue links the recipes and the header marks the catalogue', async ({
    page,
  }) => {
    await page.goto('/katalog');
    await expect(page.locator('main a[href="/retsepti"]')).toHaveCount(1);
    await page.goto('/retsepti/kiselo-zele');
    await expect(page.locator('header nav a', { hasText: 'Каталог' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('AC15: in print media the site header is hidden and the steps are shown', async ({
    page,
  }) => {
    await page.goto('/retsepti/kiselo-zele');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body > header')).toBeHidden();
    await expect(page.locator('section:has(> h2#steps) ol')).toBeVisible();
  });

  for (const path of ['/retsepti', '/retsepti/kiselo-zele']) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC15: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    test(`AC15: ${path} does not scroll sideways at 320 px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
