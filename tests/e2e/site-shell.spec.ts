import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const SHELL = { light: 'rgb(28, 63, 170)', dark: 'rgb(34, 51, 122)' };
const MAX_HEADER_HEIGHT = 64;
const GROUP_COUNT = readdirSync(join(process.cwd(), 'src', 'data', 'groups')).filter((file) =>
  file.endsWith('.yaml'),
).length;

test.describe('site shell (spec 023)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`AC5: the catalogue links to every section, group and nutrient (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/katalog');
      await expect(page.locator('h1')).toHaveCount(1);
      const main = page.locator('main');
      for (const href of ['/plodove', '/zelenchutsi', '/podpravki', '/yadki']) {
        await expect(main.locator(`a[href="${href}"]`)).toHaveCount(1);
      }
      expect(await main.locator('a[href^="/grupi/"]').count()).toBe(GROUP_COUNT);
      expect(await main.locator('a[href^="/nutrienti/"]').count()).toBe(10);
      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')['@type']));
      expect(types).toContain('CollectionPage');
      expect(types).toContain('BreadcrumbList');
      await expectNoAxeViolations(page);
    });

    test(`AC6: at 390 px the header is one shell-coloured row (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      const header = page.locator('body > header');
      const box = await header.boundingBox();
      expect(box?.height ?? Infinity).toBeLessThanOrEqual(MAX_HEADER_HEIGHT);
      expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
        SHELL[scheme],
      );
    });
  }
});
