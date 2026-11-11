import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const APPLES = '/plodove/yabalki';

test.describe('organic information', () => {
  test('AC6: the apple page shows the organic status line and passes axe', async ({ page }) => {
    await page.goto(APPLES);
    await expect(
      page.getByRole('region', { name: 'Местни ферми' }).getByText('Био в България'),
    ).toBeVisible();
    await expectNoAxeViolations(page);
  });
});
