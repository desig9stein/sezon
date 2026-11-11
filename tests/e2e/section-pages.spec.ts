import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';
import { expectNoAxeViolations, jsonLdOf } from './a11y';

const SECTIONS = {
  fruit: { path: '/plodove', name: 'Плодове' },
  vegetable: { path: '/zelenchutsi', name: 'Зеленчуци' },
  herb: { path: '/podpravki', name: 'Подправки' },
  nut: { path: '/yadki', name: 'Ядки' },
} as const;
type Kind = keyof typeof SECTIONS;

const DATA_DIR = join(process.cwd(), 'src', 'data', 'produce');
const PRODUCE = readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => {
    const { kind } = parse(readFileSync(join(DATA_DIR, file), 'utf8')) as { kind: Kind };
    return { kind, path: `${SECTIONS[kind].path}/${file.replace(/\.yaml$/, '')}` };
  });

const typesOf = async (page: Parameters<typeof jsonLdOf>[0]) =>
  (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);

test.describe('section pages', () => {
  for (const [kind, section] of Object.entries(SECTIONS) as [Kind, (typeof SECTIONS)[Kind]][]) {
    test(`AC8: ${section.path} lists every ${kind} with one h1, canonical and JSON-LD`, async ({
      page,
    }) => {
      const response = await page.goto(section.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(section.name);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(
        new RegExp(`${section.path}$`),
      );
      expect(await typesOf(page)).toEqual(
        expect.arrayContaining(['CollectionPage', 'BreadcrumbList']),
      );
      const links = await page
        .locator('main article a')
        .evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
      const expected = PRODUCE.filter((item) => item.kind === kind).map((item) => item.path);
      expect([...links].sort()).toEqual([...expected].sort());
    });
  }

  test('AC9: a produce page breadcrumb goes through its section', async ({ page }) => {
    await page.goto('/zelenchutsi/zele');
    const crumbs = page.getByRole('navigation', { name: 'Път до страницата' }).locator('li');
    await expect(crumbs).toHaveText([/Начало/, /Зеленчуци/, /Зеле/]);
    await expect(crumbs.nth(1).locator('a')).toHaveAttribute('href', '/zelenchutsi');
    const breadcrumbList = (await jsonLdOf(page)).find(
      (block) => (block as { '@type': string })['@type'] === 'BreadcrumbList',
    ) as { itemListElement: unknown[] };
    expect(breadcrumbList.itemListElement).toHaveLength(3);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC10: /zelenchutsi has no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/zelenchutsi');
      await expectNoAxeViolations(page);
    });
  }

  test('AC10: /plodove has no axe violations at 320px in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/plodove');
    await expectNoAxeViolations(page);
  });

  test('AC10: /plodove reflows at 320px with the four navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/plodove');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(
      page.getByRole('navigation', { name: 'Основна навигация' }).locator('a'),
    ).toHaveCount(4);
    await expectNoAxeViolations(page);
  });
});
