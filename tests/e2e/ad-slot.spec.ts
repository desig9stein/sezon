import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const SPONSORS_DIR = join(process.cwd(), 'src', 'data', 'sponsors');
const SPONSOR_FILES = readdirSync(SPONSORS_DIR).filter((file) => file.endsWith('.yaml'));
const PAGES = ['/zelenchutsi/zele', '/plodove/yabalki', '/sezon/noemvri', '/sezon/yuli'];

test.describe('ad slot (spec 037)', () => {
  for (const path of PAGES) {
    test(`AC10: ${path} has no ad slot while there are no sponsors`, async ({ page }) => {
      test.skip(SPONSOR_FILES.length > 0, 'Sponsors exist, so the empty-collection check is moot.');
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('.ad-slot')).toHaveCount(0);
    });
  }
});
