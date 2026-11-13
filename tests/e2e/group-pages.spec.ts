import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const GROUP = '/grupi/krastotsvetni';

test.describe('group pages', () => {
  test('AC5: the group page lists its produce with heading, Latin name and JSON-LD', async ({
    page,
  }) => {
    const response = await page.goto(GROUP);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Кръстоцветни');
    await expect(page.locator('main [lang="la"]', { hasText: 'Brassicaceae' })).toHaveCount(1);
    await expect(page.locator('.group-header__description')).toContainText('Семейство');
    await expect(page.locator('h1')).toHaveAttribute('data-search-latin', 'krastotsvetni');
    await expect(page.locator('h1')).toHaveAttribute(
      'data-pagefind-index-attrs',
      'data-search-latin',
    );
    await expect(page.locator('main a[href="/zelenchutsi/zele"]').first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/grupi\/krastotsvetni$/,
    );
    const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
    expect(types).toEqual(expect.arrayContaining(['CollectionPage', 'BreadcrumbList']));
    await expect(page.locator('[data-pagefind-body]')).toHaveCount(1);
  });

  test('AC6: the produce page links its family to the group page', async ({ page }) => {
    await page.goto('/zelenchutsi/zele');
    const link = page.locator(`main a[href="${GROUP}"]`);
    await expect(link).toHaveCount(1);
    const [linkSize, latinSize] = await Promise.all([
      link.evaluate((element) => getComputedStyle(element).fontSize),
      link.locator('[lang="la"]').evaluate((element) => getComputedStyle(element).fontSize),
    ]);
    expect(latinSize).toBe(linkSize);
  });

  test('QA 017: a produce outranks its group in search', async ({ page }) => {
    await page.goto('/tarsene?q=тикв');
    const results = page.locator('[data-search-results] a');
    await expect(page.locator('[data-search-results] a[href="/grupi/tikvovi"]')).toHaveCount(1);
    const hrefs = await results.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    );
    const groupIndex = hrefs.indexOf('/grupi/tikvovi');
    expect(groupIndex).toBeGreaterThan(-1);
    for (const produce of ['/zelenchutsi/tikva', '/zelenchutsi/tikvichki']) {
      expect(hrefs, produce).toContain(produce);
      expect(hrefs.indexOf(produce), produce).toBeLessThan(groupIndex);
    }
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC7: ${GROUP} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(GROUP);
      await expectNoAxeViolations(page);
    });
  }

  test('AC7: at 320px the group page does not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(GROUP);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page);
  });
});
