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
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
    const headers = readFileSync(join(DIST, '_headers'), 'utf8');
    expect(headers).toMatch(
      /Content-Security-Policy: default-src 'self';.*script-src 'self'.*form-action 'self'/,
    );
    expect(headers).toContain('Strict-Transport-Security: max-age=31536000');
    expect(headers).toMatch(/\/_astro\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
    expect(existsSync(join(DIST, 'favicon.svg'))).toBe(true);
  });

  test('AC5: the 404 page links home and to the current month', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main a[href="/"]')).toHaveCount(1);
    const notFoundMonth = await page.locator('main a[href^="/sezon/"]').getAttribute('href');
    await page.goto('/');
    const currentMonth = await page
      .locator('footer a[href^="/sezon/"][aria-current="date"]')
      .getAttribute('href');
    expect(notFoundMonth).toBe(currentMonth);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const width of [1280, 320]) {
      test(`AC5: the 404 page has no axe violations (${colorScheme}, ${width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ colorScheme });
        await page.goto('/404');
        await expectNoAxeViolations(page);
      });
    }
  }
});
