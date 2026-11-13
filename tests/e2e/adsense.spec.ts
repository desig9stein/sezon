import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const PAGES = ['/zelenchutsi/zele', '/plodove/yabalki', '/sezon/noemvri', '/sezon/yuli', '/'];
const DIST = join(process.cwd(), 'dist');
const AD_HOSTS = /googlesyndication|fundingchoicesmessages|doubleclick/;

test.describe('lazy AdSense (spec 045)', () => {
  for (const path of PAGES) {
    test(`AC12: ${path} requests no ad or consent code with AdSense off`, async ({ page }) => {
      test.skip(
        (process.env.PUBLIC_ADSENSE_CLIENT ?? '').trim() !== '',
        'AdSense is enabled in this build.',
      );
      const requests: string[] = [];
      page.on('request', (request) => {
        if (AD_HOSTS.test(request.url())) requests.push(request.url());
      });
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForLoadState('networkidle');
      expect(requests).toEqual([]);
      await expect(page.locator('ins.adsbygoogle, .ad-slot--adsense')).toHaveCount(0);
      expect(await page.content()).not.toContain('adsbygoogle');
    });
  }

  test('AC13, QA2: with AdSense off, the built _headers is the committed file, with no Google host', () => {
    test.skip(
      (process.env.PUBLIC_ADSENSE_CLIENT ?? '').trim() !== '',
      'AdSense is enabled in this build.',
    );
    const built = readFileSync(join(process.cwd(), 'dist', '_headers'), 'utf8');
    const committed = readFileSync(join(process.cwd(), 'public', '_headers'), 'utf8');
    expect(built).toBe(committed);
    expect(built).not.toMatch(AD_HOSTS);
    expect(built).toContain("frame-ancestors 'none'");
  });

  test('QA7: with AdSense off, no built page references the AdSense or privacy scripts', () => {
    test.skip(
      (process.env.PUBLIC_ADSENSE_CLIENT ?? '').trim() !== '',
      'AdSense is enabled in this build.',
    );
    const pages = readdirSync(DIST, { recursive: true, encoding: 'utf8' }).filter((file) =>
      file.endsWith('.html'),
    );
    expect(pages.length).toBeGreaterThan(0);
    const offending = pages.filter((file) =>
      /AdSenseLoader|PrivacySettings|adsenseLoader|privacySettings|googlesyndication|fundingchoicesmessages/.test(
        readFileSync(join(DIST, file), 'utf8'),
      ),
    );
    expect(offending).toEqual([]);
  });
});
