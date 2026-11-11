import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const CARROTS = '/zelenchutsi/morkovi';

test.describe('growing guide', () => {
  test('AC6: the carrot page shows the growing section with month links', async ({ page }) => {
    await page.goto(CARROTS);
    const section = page.getByRole('region', { name: 'Отглеждане в градината' });
    await expect(section).toBeVisible();
    await expect(section.locator('dt').first()).toBeVisible();
    await expect(section.locator('a[href^="/sezon/"]').first()).toBeVisible();
    await expect(section.locator('ul > li')).not.toHaveCount(0);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC6: the carrot page has no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(CARROTS);
      await expectNoAxeViolations(page);
    });
  }

  test('QA 018: at 320px the section has no axe violations and no sideways scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(CARROTS);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page);
  });
});
