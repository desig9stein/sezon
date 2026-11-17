import { expect, test } from '@playwright/test';

const CERTIFICATE_URL =
  'https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/BG-BIO-18.100-0004936.2026.001.pdf';

test.describe('content and safety, round 2 (spec 061)', () => {
  test('AC15: the farm page links the certificate in the label and names it in the sources', async ({
    page,
  }) => {
    await page.goto('/fermi/vkusnagradina');
    const links = page.locator(`a[href="${CERTIFICATE_URL}"]`);
    await expect(links.first()).toContainText('сертификат № BG-BIO-18.100-0004936.2026.001');
    await expect(page.locator('#farm-sources ~ ul a', { hasText: 'TRACES' })).toHaveText(
      'Сертификат в TRACES (ЕС): BG-BIO-18.100-0004936.2026.001',
    );
  });

  test('AC15: the methodology links the EU list of organic operators', async ({ page }) => {
    await page.goto('/metodologiya');
    await expect(
      page.locator(
        'a[href="https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/index"]',
      ),
    ).toHaveCount(1);
  });

  test('AC5: a recipe page lists Sofia under 300–1800 м', async ({ page }) => {
    await page.goto('/retsepti/sladko-ot-yabalki');
    await expect(page.locator('.altitude-towns li', { hasText: '300–1800 м' })).toContainText(
      'София',
    );
  });
});
