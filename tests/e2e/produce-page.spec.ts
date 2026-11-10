import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const SECTIONS: Record<string, string> = {
  fruit: 'plodove',
  vegetable: 'zelenchutsi',
  herb: 'podpravki',
  nut: 'yadki',
};
const DATA_DIR = join(process.cwd(), 'src', 'data', 'produce');
const PAGES = readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => {
    const { kind } = parse(readFileSync(join(DATA_DIR, file), 'utf8')) as { kind: string };
    return `/${SECTIONS[kind]}/${file.replace(/\.yaml$/, '')}`;
  });

test.describe('produce pages', () => {
  for (const path of PAGES) {
    test(`AC10: ${path} is built with one h1, canonical and JSON-LD`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(
        new RegExp(`${path}$`),
      );
      const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
      expect(types).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList']));
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const path of ['/zelenchutsi/zele', '/podpravki/kopar', '/yadki/orehi']) {
      test(`AC10: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }
  }

  test('AC10: a produce page reflows at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/zelenchutsi/spanak');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page);
  });
});
