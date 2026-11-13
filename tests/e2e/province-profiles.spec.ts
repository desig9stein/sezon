import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const HEADING = 'Земеделие в областта';
const NBSP = ' ';

test.describe('province profiles (spec 038)', () => {
  test('AC13: /regioni links all 28 provinces', async ({ page }) => {
    await page.goto('/regioni');
    await expect(page.locator('main .regions__list > li > a')).toHaveCount(28);
  });

  test('AC14: the Plovdiv page shows the agriculture section with its sources', async ({
    page,
  }) => {
    await page.goto('/regioni/plovdiv');
    const headings = await page.locator('main h2').allTextContents();
    const index = headings.map((text) => text.trim()).indexOf(HEADING);
    expect(index).toBe(0);
    expect(headings.map((text) => text.trim())[1]).toBe('Какво расте тук');
    const mapBeforeSection = await page.evaluate(() => {
      const map = document.querySelector('main figure.province-map');
      const section = document.querySelector('main section[aria-labelledby="region-profile"]');
      return (
        map !== null &&
        section !== null &&
        (map.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
      );
    });
    expect(mapBeforeSection).toBe(true);
    const section = page.locator('section[aria-labelledby="region-profile"]');
    await expect(section).toContainText(`257${NBSP}175 ха (2025 г.) – пета по големина`);
    await expect(section).toContainText(`черешите (1${NBSP}676 ха)`);
    const sources = section.locator('ul a');
    await expect(sources).toHaveCount(2);
    await expect(sources.first()).toHaveAttribute('href', /ra_465_publicationbancik2025\.pdf$/);
    await expect(sources.last()).toHaveAttribute('href', /ra448_publicationstructureorchard2023/);
  });

  test('AC15: Smolyan has a page with the section and the empty states', async ({ page }) => {
    const response = await page.goto('/regioni/smolyan');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 2, name: HEADING })).toBeVisible();
    const section = page.locator('section[aria-labelledby="region-profile"]');
    await expect(section).toContainText(`34${NBSP}777 ха (2025 г.) – двадесет и осма`);
    await expect(section).not.toContainText('овощни');
    await expect(section.locator('ul a')).toHaveCount(1);
    await expect(page.locator('main .region__intro')).toHaveText(
      'Земеделието в областта според статистиката на МЗХ.',
    );
    await expect(page.locator('main')).toContainText(
      'Все още няма продукти, свързани с тази област.',
    );
    await expect(page.locator('main')).toContainText('Все още няма добавени ферми от тази област.');
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC15: /regioni/smolyan has no axe violations in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/regioni/smolyan');
      await expectNoAxeViolations(page);
    });
  }
});
