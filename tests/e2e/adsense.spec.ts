import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const PAGES = ['/zelenchutsi/zele', '/plodove/yabalki', '/sezon/noemvri', '/sezon/yuli', '/'];
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

  test('AC13: the CSP allows the AdSense and consent scripts and still forbids framing', () => {
    const headers = readFileSync(join(process.cwd(), 'dist', '_headers'), 'utf8');
    const csp = headers.match(/Content-Security-Policy: (.*)/)?.[1] ?? '';
    const directive = (name: string) =>
      csp
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name} `)) ?? '';
    expect(directive('script-src')).toContain('https://pagead2.googlesyndication.com');
    expect(directive('script-src')).toContain('https://fundingchoicesmessages.google.com');
    expect(directive('script-src')).not.toMatch(/'unsafe-inline'|\*/);
    expect(directive('frame-ancestors')).toBe("frame-ancestors 'none'");
  });
});
