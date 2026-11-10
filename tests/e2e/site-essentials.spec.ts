import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const DIST = join(process.cwd(), 'dist');

test.describe('site essentials', () => {
  test('AC4: the build contains 404, robots, sitemap and headers', () => {
    const notFound = readFileSync(join(DIST, '404.html'), 'utf8');
    expect(notFound).toContain('<meta name="robots" content="noindex, follow">');
    expect(readFileSync(join(DIST, 'robots.txt'), 'utf8')).toMatch(
      /^Sitemap: https:\/\/.+\/sitemap-index\.xml$/m,
    );
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    expect(sitemap).toContain('/sezon/noemvri</loc>');
    expect(sitemap).toContain('/zelenchutsi/zele</loc>');
    expect(sitemap).not.toContain('/404');
    expect(existsSync(join(DIST, '_headers'))).toBe(true);
    expect(existsSync(join(DIST, 'favicon.svg'))).toBe(true);
  });

  test('AC5: the 404 page helps the visitor and is accessible', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main a[href="/"]')).toHaveCount(1);
    await expect(page.locator('main a[href^="/sezon/"]')).toHaveCount(1);
    await expectNoAxeViolations(page);
  });
});
