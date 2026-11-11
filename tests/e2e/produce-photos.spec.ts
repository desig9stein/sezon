import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const PRODUCE_PAGE = '/zelenchutsi/zele';

test.describe('produce photos', () => {
  test('AC6: the produce page Article JSON-LD has an absolute image URL', async ({ page }) => {
    await page.goto(PRODUCE_PAGE);
    const article = (await jsonLdOf(page)).find(
      (block) => (block as { '@type': string })['@type'] === 'Article',
    ) as { image?: string } | undefined;
    expect(article?.image).toMatch(/^https:\/\/[^/]+\/_astro\/.+\.jpg$/);
  });

  test('AC7: the produce page photo loads as AVIF and is not broken', async ({ page }) => {
    const avif = page.waitForResponse(
      (response) => response.request().resourceType() === 'image' && /\.avif$/.test(response.url()),
    );
    await page.goto(PRODUCE_PAGE);
    expect((await avif).status()).toBe(200);
    const image = page.locator('figure picture img');
    await expect(image).toHaveCount(1);
    expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  for (const path of ['/', PRODUCE_PAGE]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC7: ${path} with photos has no axe violations in ${colorScheme} mode`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const broken = await page.locator('img').evaluateAll((images) =>
          images
            .filter((img) => (img as HTMLImageElement).complete)
            .filter((img) => (img as HTMLImageElement).naturalWidth === 0)
            .map((img) => img.outerHTML.slice(0, 80)),
        );
        expect(broken).toEqual([]);
        await expectNoAxeViolations(page);
      });
    }
  }

  test('AC7: the home page shows plate photos as AVIF', async ({ page }) => {
    const avif = page.waitForResponse(
      (response) => response.request().resourceType() === 'image' && /\.avif$/.test(response.url()),
    );
    await page.goto('/');
    expect((await avif).status()).toBe(200);
    expect(await page.locator('main picture img').count()).toBeGreaterThan(0);
  });

  test('QA 015: all peak plates on the home page have the same size', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const sizes = await page.locator('.group[data-variant="plate"] li').evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return `${Math.round(box.width)}`;
      }),
    );
    expect(sizes.length).toBeGreaterThan(1);
    expect(new Set(sizes).size).toBe(1);
  });
});
