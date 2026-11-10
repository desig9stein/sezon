import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** WCAG rule tags checked on every page. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Fails the test when axe reports any violation on the current page. */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    })),
  ).toEqual([]);
}

/** Returns every JSON-LD block on the current page, parsed. */
export async function jsonLdOf(page: Page): Promise<unknown[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((block) => JSON.parse(block) as unknown);
}
