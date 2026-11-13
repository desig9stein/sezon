import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

test.describe('more farms (spec 051)', () => {
  test('AC9: the ВКУСнаГРАДИНА page shows its organic certifier and passes axe', async ({
    page,
  }) => {
    await page.goto('/fermi/vkusnagradina');
    await expect(page.locator('h1')).toHaveText('ВКУСнаГРАДИНА');
    await expect(page.locator('main')).toContainText('Био · COSMOCERT (BG-BIO-18)');
    await expectNoAxeViolations(page);
  });

  test('AC9: the Razgrad page lists Оранжерии Паскалев and passes axe', async ({ page }) => {
    await page.goto('/regioni/razgrad');
    await expect(page.locator('main a[href="/fermi/oranzherii-paskalev"]').first()).toHaveText(
      'Оранжерии Паскалев',
    );
    await expectNoAxeViolations(page);
  });
});
