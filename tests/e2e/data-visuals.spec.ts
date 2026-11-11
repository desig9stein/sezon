import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';
import { removeAllCss } from './noCss';

const PAGE = '/zelenchutsi/morkovi';

test.describe('data visuals (spec 026)', () => {
  test('AC9: the map follows the region list and the garden row is in the season section', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const regions = page.locator('section:has(> h3#regions)');
    await expect(regions.locator('ul + figure.province-map svg[role="img"]')).toHaveCount(1);
    await expect(
      page.locator('section:has(> h3#season)').getByRole('list', { name: 'В градината' }),
    ).toHaveCount(1);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC9: no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE);
      await expectNoAxeViolations(page);
    });
  }

  test('AC10: no horizontal scroll at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PAGE);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('AC10: the map stays at most 320 px wide without CSS', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PAGE);
    await removeAllCss(page);
    const box = await page.locator('figure.province-map svg').boundingBox();
    expect(box?.width).toBeLessThanOrEqual(320);
  });
});
