import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const SEARCH = '/tarsene';

/** Opens the search page with `query` and waits for the status to report the outcome. */
async function searchFor(page: Page, query: string): Promise<void> {
  await page.goto(`${SEARCH}?q=${encodeURIComponent(query)}`);
  await expect(page.getByRole('status')).toContainText(query);
}

/** Returns the hrefs of the result links in order. */
async function resultLinks(page: Page): Promise<string[]> {
  return page
    .locator('[data-search-results] a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
}

test.describe('search findability (spec 059)', () => {
  test('AC10: every page type except home and search is indexed with a type', async ({ page }) => {
    for (const path of [
      '/fermi/venets',
      '/fermi',
      '/regioni/plovdiv',
      '/regioni',
      '/sezon/mart',
      '/retsepti/kiselo-zele',
      '/retsepti',
      '/grupi/krastotsvetni',
      '/nutrienti/vitamin-c',
      '/plodove',
      '/plodove/yabalki',
      '/katalog',
      '/kalendar',
      '/za-nas',
      '/metodologiya',
      '/poveritelnost',
      '/biskvitki',
      '/reklama',
    ]) {
      await page.goto(path);
      expect(await page.locator('[data-pagefind-body]').count(), path).toBeGreaterThanOrEqual(1);
      await expect(page.locator('[data-pagefind-meta^="type:"]'), path).toHaveCount(1);
      await expect(page.locator('h1'), path).toHaveAttribute('data-search-latin', /^[a-z0-9 ]+$/);
    }
    for (const path of ['/', SEARCH]) {
      await page.goto(path);
      await expect(page.locator('[data-pagefind-body]'), path).toHaveCount(0);
    }
  });

  test('AC11: produce pages keep credits, calendars, farms, sources and the TOC out of the index', async ({
    page,
  }) => {
    await page.goto('/plodove/yabalki');
    for (const selector of [
      '.produce-photo__credit',
      '.produce__toc',
      '#season',
      '#farms',
      '#sources',
    ]) {
      const ignored = await page
        .locator(selector)
        .first()
        .evaluate((element) => element.closest('[data-pagefind-ignore]') !== null);
      expect(ignored, selector).toBe(true);
    }
  });

  for (const [query, first] of [
    ['витамин С', '/nutrienti/vitamin-c'],
    ['рецепта', '/retsepti'],
    ['ферма', '/fermi'],
    ['март', '/sezon/mart'],
    ['календар', '/kalendar'],
    ['поверителност', '/poveritelnost'],
    ['пловдив', '/regioni/plovdiv'],
  ] as const) {
    test(`AC12: „${query}“ lists ${first} first`, async ({ page }) => {
      await searchFor(page, query);
      expect((await resultLinks(page))[0]).toBe(first);
    });
  }

  test('AC12: „ябълка“ finds the apple page among the first three', async ({ page }) => {
    await searchFor(page, 'ябълка');
    expect((await resultLinks(page)).slice(0, 3)).toContain('/plodove/yabalki');
  });

  test('AC12: „ферма Пловдив“ lists a Plovdiv farm or the Plovdiv page first', async ({ page }) => {
    await searchFor(page, 'ферма Пловдив');
    expect([
      '/regioni/plovdiv',
      '/fermi/gradina-dzhumerski',
      '/fermi/fermata-na-kris-i-maria',
      '/fermi/yadkova-gradina-orle',
    ]).toContain((await resultLinks(page))[0]);
  });

  test('AC12: each result shows its type above the title', async ({ page }) => {
    await searchFor(page, 'ферма');
    const first = page.locator('[data-search-results] li').first();
    await expect(first.locator('.site-search__type')).toHaveText('Раздел');
    await searchFor(page, 'венец');
    await expect(
      page.locator('[data-search-results] li').first().locator('.site-search__type'),
    ).toHaveText('Ферма');
  });

  for (const query of ['гъби', 'мечи лук', 'черемша']) {
    test(`AC13: „${query}“ honestly shows no results`, async ({ page }) => {
      await searchFor(page, query);
      await expect(page.getByRole('status')).toHaveText(`Няма резултати за „${query}“.`);
      expect(await resultLinks(page)).toEqual([]);
    });
  }

  test('AC14: „Покажи още“ adds results and moves focus to the first new one', async ({ page }) => {
    await searchFor(page, 'ябълки');
    await expect(page.getByRole('status')).toContainText('Показани са първите 10.');
    expect(await resultLinks(page)).toHaveLength(10);
    const more = page.getByRole('button', { name: 'Покажи още' });
    await more.click();
    await expect(page.locator('[data-search-results] a').nth(10)).toBeFocused();
    expect((await resultLinks(page)).length).toBeGreaterThan(10);
    await expect(page.getByRole('status')).toContainText(/Показани са \d+ от \d+\./);
    await expectNoAxeViolations(page);
  });

  for (const [query, first] of [
    ['ябълката', '/plodove/yabalki'],
    ['кога се сее пипер', '/zelenchutsi/piper'],
    ['какво да засадя през март', '/sezon/mart'],
    ['за нас', '/za-nas'],
    ['зеле', '/zelenchutsi/zele'],
    ['"ябълки"', '/plodove/yabalki'],
    ['София-град', '/regioni/sofia-grad'],
  ] as const) {
    test(`QA 059: „${query}“ lists ${first} first`, async ({ page }) => {
      await searchFor(page, query);
      expect((await resultLinks(page))[0]).toBe(first);
    });
  }

  test('QA 059: „ферма“ finds the farm list and the farm pages, not every page with a farm label', async ({
    page,
  }) => {
    await searchFor(page, 'ферма');
    const count = Number(
      /Резултати: (\d+)/.exec((await page.getByRole('status').textContent()) ?? '')?.[1],
    );
    const farmPages = readdirSync(join(process.cwd(), 'src', 'data', 'farms')).filter((file) =>
      file.endsWith('.yaml'),
    ).length;
    expect(count).toBeGreaterThanOrEqual(farmPages);
    expect(count).toBeLessThanOrEqual(farmPages + 10);
  });
});
