import { expect, test } from '@playwright/test';
import { ui } from '../../src/i18n/bg';
import { expectNoAxeViolations, jsonLdOf } from './a11y';
import { removeAllCss } from './noCss';

const EMAIL = 'mspopovv@gmail.com';
const PARTNER_SITES = 'https://policies.google.com/technologies/partner-sites';
const ADSENSE_ON = (process.env.PUBLIC_ADSENSE_CLIENT ?? '').trim() !== '';

const PAGES = [
  {
    path: '/reklama',
    title: ui.advertising.heading,
    sections: [
      ui.advertising.offerHeading,
      ui.advertising.labelsHeading,
      ui.advertising.dataHeading,
      ui.advertising.contactHeading,
    ],
  },
  {
    path: '/poveritelnost',
    title: ui.privacy.heading,
    sections: [
      ui.privacy.controllerHeading,
      ui.privacy.collectedHeading,
      ui.privacy.emailHeading,
      ui.privacy.githubHeading,
      ui.privacy.adsHeading,
    ],
  },
  {
    path: '/biskvitki',
    title: ui.cookies.heading,
    sections: [ui.cookies.siteHeading, ui.cookies.googleHeading, ui.cookies.settingsHeading],
  },
] as const;

test.describe('advertising, privacy and cookies pages (spec 046)', () => {
  for (const { path, title, sections } of PAGES) {
    test(`AC6: ${path} exists with one h1 and its sections`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator('main h2')).toHaveText([...sections]);
    });

    test(`AC12: ${path} has WebPage and BreadcrumbList structured data`, async ({ page }) => {
      await page.goto(path);
      const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
      expect(types).toEqual(expect.arrayContaining(['WebPage', 'BreadcrumbList']));
      expect([...(await page.title())].length).toBeLessThanOrEqual(60);
    });

    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC13: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    test(`AC13: ${path} fits 320 px and reads in order without CSS`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await removeAllCss(page);
      const order = await page.evaluate(() =>
        [...document.querySelectorAll('main h1, main h2')].map((heading) => heading.tagName),
      );
      expect(order[0]).toBe('H1');
      expect(order.slice(1).every((tag) => tag === 'H2')).toBe(true);
    });
  }

  test('AC7: the advertising page labels ads, keeps data apart, gives the email and no price', async ({
    page,
  }) => {
    await page.goto('/reklama');
    const main = page.locator('main');
    await expect(main).toContainText('„Реклама“');
    await expect(main).toContainText('„Спонсорирано“');
    await expect(main).toContainText('платени');
    await expect(main.locator('section:has(> h2#ad-data)')).toContainText('не може');
    await expect(main.locator(`a[href^="mailto:${EMAIL}"]`)).toHaveCount(1);
    await expect(main).not.toContainText(/лв|€|EUR|посетител/);
  });

  test('AC8: the privacy policy names the controller and says what the site does', async ({
    page,
  }) => {
    await page.goto('/poveritelnost');
    const main = page.locator('main');
    await expect(main.locator('section:has(> h2#privacy-controller)')).toContainText('Марин Попов');
    await expect(
      main.locator(`section:has(> h2#privacy-controller) a[href^="mailto:${EMAIL}"]`),
    ).toHaveCount(1);
    await expect(main.locator('section:has(> h2#privacy-collected)')).toContainText('бисквитки');
    await expect(main.locator('section:has(> h2#privacy-collected)')).toContainText(
      'анализ на посещенията',
    );
    await expect(main.locator('section:has(> h2#privacy-email)')).toContainText(
      'само за да ти отговорим',
    );
    await expect(main.locator('section:has(> h2#privacy-github)')).toContainText('публични');
    await expect(main.locator('a[href="/biskvitki"]').first()).toBeVisible();
  });

  test('AC9: the cookies page lists none from Sezon and offers no settings with AdSense off', async ({
    page,
  }) => {
    test.skip(ADSENSE_ON, 'AdSense is enabled in this build.');
    await page.goto('/biskvitki');
    const main = page.locator('main');
    await expect(main.locator('section:has(> h2#cookies-site)')).toContainText(ui.cookies.siteOff);
    await expect(main.locator(`a[href="${PARTNER_SITES}"]`)).toHaveCount(1);
    await expect(main).toContainText(ui.cookies.noConsentStored);
    await expect(main.locator('button')).toHaveCount(0);
    await expect(
      page.locator('script[src*="privacySettings"], script[src*="PrivacySettings"]'),
    ).toHaveCount(0);
  });

  for (const path of ['/', '/plodove/yabalki', '/biskvitki']) {
    test(`AC10: the footer of ${path} links the three pages`, async ({ page }) => {
      await page.goto(path);
      const footer = page.locator('footer');
      for (const href of ['/reklama', '/poveritelnost', '/biskvitki']) {
        await expect(footer.locator(`a[href="${href}"]`), href).toHaveCount(1);
      }
    });
  }

  test('AC11: the about page links the privacy, cookies and advertising pages', async ({
    page,
  }) => {
    await page.goto('/za-nas');
    const privacy = page.locator('section:has(> h2#about-privacy)');
    await expect(privacy.locator('a[href="/poveritelnost"]')).toHaveCount(1);
    await expect(privacy.locator('a[href="/biskvitki"]')).toHaveCount(1);
    await expect(page.locator('section:has(> h2#about-ads) a[href="/reklama"]')).toHaveCount(1);
  });

  test('QA5: with AdSense off, the about page says there are no ads and no cookies', async ({
    page,
  }) => {
    test.skip(ADSENSE_ON, 'AdSense is enabled in this build.');
    await page.goto('/za-nas');
    await expect(page.locator('section:has(> h2#about-ads)')).toContainText(ui.about.adsOff);
    await expect(page.locator('section:has(> h2#about-privacy)')).toContainText(
      ui.about.privacyOff,
    );
  });
});
