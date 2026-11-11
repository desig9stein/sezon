import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

test.describe('real farms', () => {
  test('AC4: the carrot page lists a real farm and passes axe', async ({ page }) => {
    await page.goto('/zelenchutsi/morkovi');
    const farms = page.getByRole('region', { name: 'Местни ферми' });
    await expect(farms.getByRole('heading', { name: 'Био-ферма Софина' })).toBeVisible();
    await expect(farms).not.toContainText('Примерни данни');
    await expectNoAxeViolations(page);
  });
});
