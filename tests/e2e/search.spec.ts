import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const SEARCH = '/tarsene';

/** Types `query` into the search field and waits for the status to report the outcome. */
async function search(page: Page, query: string): Promise<void> {
  await page.getByRole('searchbox').fill(query);
  await expect(page.getByRole('status')).toContainText(query);
}

/** Returns the hrefs of the result links in order. */
async function resultLinks(page: Page): Promise<string[]> {
  return page
    .locator('[data-search-results] a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
}

test.describe('site search', () => {
  test('AC3: /tarsene has one h1, is noindex and is not in the sitemap', async ({ page }) => {
    await page.goto(SEARCH);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    const sitemap = await (await page.request.get('/sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/tarsene');
  });

  test('AC4: only produce, section and nutrient pages are indexed, with Latin headings', async ({
    page,
  }) => {
    for (const path of ['/plodove/yabalki', '/plodove', '/nutrienti/vitamin-c']) {
      await page.goto(path);
      await expect(page.locator('[data-pagefind-body]')).toHaveCount(1);
      const h1 = page.locator('h1');
      await expect(h1).toHaveAttribute('data-pagefind-index-attrs', 'data-search-latin');
      await expect(h1).toHaveAttribute('data-search-latin', /^[a-z0-9 ]+$/);
    }
    for (const path of ['/', '/sezon/noemvri', '/kalendar', SEARCH]) {
      await page.goto(path);
      await expect(page.locator('[data-pagefind-body]')).toHaveCount(0);
    }
  });

  for (const query of ['ябълки', 'yabalki', 'ябъл']) {
    test(`AC6: „${query}“ lists the apple page first`, async ({ page }) => {
      await page.goto(SEARCH);
      await search(page, query);
      expect((await resultLinks(page))[0]).toBe('/plodove/yabalki');
      await expect(page.getByRole('status')).toContainText(/Намерени резултати: \d+/);
    });
  }

  test('AC6: „витамин“ lists a nutrient page and nonsense finds nothing', async ({ page }) => {
    await page.goto(SEARCH);
    await search(page, 'витамин');
    expect((await resultLinks(page)).some((href) => href.startsWith('/nutrienti/'))).toBe(true);
    await search(page, 'щзхжйцу');
    await expect(page.getByRole('status')).toContainText('Няма резултати');
    expect(await resultLinks(page)).toEqual([]);
  });

  test('AC7: ?q= fills the field and shows the results', async ({ page }) => {
    await page.goto(`${SEARCH}?q=praz`);
    await expect(page.getByRole('searchbox')).toHaveValue('praz');
    await expect(page.locator('[data-search-results] a').first()).toHaveAttribute(
      'href',
      '/zelenchutsi/praz',
    );
  });

  test('AC8: Pagefind loads only on /tarsene and only after interaction', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/pagefind/')) requests.push(request.url());
    });
    for (const path of ['/', '/plodove/yabalki', '/kalendar']) await page.goto(path);
    await page.goto(SEARCH);
    await page.waitForLoadState('networkidle');
    expect(requests).toEqual([]);
    await page.getByRole('searchbox').focus();
    await expect.poll(() => requests.length).toBeGreaterThan(0);
  });

  test('AC10: the search page has no inline script', async ({ page }) => {
    await page.goto(SEARCH);
    const inline = await page
      .locator('script:not([src]):not([type="application/ld+json"])')
      .count();
    expect(inline).toBe(0);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC9: /tarsene with results has no axe violations in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(SEARCH);
      await search(page, 'ябълки');
      await expectNoAxeViolations(page);
    });
  }

  test('AC9: at 320px /tarsene does not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(SEARCH);
    await search(page, 'ябълки');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page);
  });
});

test.describe('site search without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('AC9: shows the noscript note and the browse links', async ({ page }) => {
    await page.goto(SEARCH);
    // Chromium's script-disabled mode still parses <noscript> as raw text, so check its markup.
    expect(await page.locator('main noscript').innerHTML()).toContain(
      'Търсенето изисква JavaScript',
    );
    await expect(page.locator('main a[href="/plodove"]')).toHaveCount(1);
    await expect(page.locator('main a[href="/kalendar"]')).toHaveCount(1);
  });
});
