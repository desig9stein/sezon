import { expect, test } from '@playwright/test';

/** Smallest target size in CSS pixels (WCAG 2.5.8). */
const MIN_TARGET = 24;

test.describe('emergency line (spec 058, QA)', () => {
  for (const path of ['/zelenchutsi/levurda', '/yadki/kesteni']) {
    test(`QA 058: ${path} links 112 as a tel: link of at least 24 × 24 px`, async ({ page }) => {
      await page.goto(path);
      const call = page.locator('.cautions a[href="tel:112"]');
      await expect(call).toHaveCount(1);
      await expect(call).toHaveText('112');
      const box = await call.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(MIN_TARGET);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TARGET);
      await expect(page.locator('.cautions')).not.toContainText('9154');
    });
  }
});
