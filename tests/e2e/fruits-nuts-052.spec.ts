import { expect, test } from '@playwright/test';

test.describe('more fruits and nuts (spec 052)', () => {
  test('AC12: a produce without nutrition has no „хранителни стойности“ in its title', async ({
    page,
  }) => {
    await page.goto('/plodove/mushmuli');
    await expect(page).toHaveTitle('Мушмули – сезон и ферми | Сезон');
  });

  test('AC12: a produce with nutrition keeps „хранителни стойности“ in its title', async ({
    page,
  }) => {
    await page.goto('/plodove/nar');
    await expect(page).toHaveTitle('Нар – сезон, хранителни стойности и ферми | Сезон');
  });
});
