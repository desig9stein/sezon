import { expect, test } from '@playwright/test';
import { ui } from '../../src/i18n/bg';
import { expectNoAxeViolations, jsonLdOf } from './a11y';
import { removeAllCss } from './noCss';

const ABOUT_SECTIONS = 10;
const METHODOLOGY_SECTIONS = 8;
const FORM = 'https://github.com/desig9stein/sezon/issues/new';

test.describe('about and methodology (spec 031)', () => {
  test('AC5: the about page has its sections and links, including the owner email', async ({
    page,
  }) => {
    await page.goto('/za-nas');
    await expect(page.locator('main h2')).toHaveCount(ABOUT_SECTIONS);
    const about = ui.about;
    await expect(page.locator('main h2')).toHaveText([
      about.whatHeading,
      about.whoHeading,
      about.aiHeading,
      about.sourcesHeading,
      about.openHeading,
      about.errorsHeading,
      about.farmHeading,
      about.adsHeading,
      about.privacyHeading,
      about.healthHeading,
    ]);
    await expect(page.locator('main #greshka')).toHaveCount(1);
    await expect(page.locator('main #dobavi-ferma')).toHaveCount(1);
    await expect(
      page.locator('main a[href="https://github.com/desig9stein"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('main a[href="https://github.com/desig9stein/sezon"]').first(),
    ).toBeVisible();
    await expect(page.locator('main a[href="/metodologiya"]').first()).toBeVisible();
    await expect(page.locator(`main a[href^="${FORM}"]`).first()).toBeVisible();
    await expect(page.locator('main')).toContainText('MIT');
    await expect(page.locator('main')).toContainText('CC BY 4.0');
    const greshka = page.locator('section:has(> h2#greshka)');
    await expect(greshka.locator('a[href^="mailto:mspopovv@gmail.com"]')).toHaveCount(1);
    const farm = page.locator('section:has(> h2#dobavi-ferma)');
    await expect(farm.locator('a[href^="mailto:mspopovv@gmail.com"]')).toHaveCount(1);
  });

  test('AC6: the methodology names its sources and links to corrections', async ({ page }) => {
    await page.goto('/metodologiya');
    await expect(page.locator('main h2')).toHaveCount(METHODOLOGY_SECTIONS);
    const method = ui.methodology;
    await expect(page.locator('main h2')).toHaveText([
      method.nutritionHeading,
      method.seasonHeading,
      method.regionsHeading,
      method.traditionalHeading,
      method.growingHeading,
      method.farmsHeading,
      method.reviewHeading,
      method.correctionsHeading,
    ]);
    await expect(page.locator('main a[href^="https://fdc.nal.usda.gov"]').first()).toBeVisible();
    await expect(page.locator('main a[href*="efsa.europa.eu"]').first()).toBeVisible();
    await expect(page.locator('main a[href="/za-nas#greshka"]').first()).toBeVisible();
  });

  for (const path of ['/', '/plodove/yabalki', '/regioni/plovdiv']) {
    test(`AC7: the footer of ${path} links about, methodology and a report for that page`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer.locator('a[href="/za-nas"]')).toHaveCount(1);
      await expect(footer.locator('a[href="/metodologiya"]')).toHaveCount(1);
      const report = footer.locator(`a[href^="${FORM}"]`);
      await expect(report).toHaveCount(1);
      const href = (await report.getAttribute('href')) ?? '';
      const reported = new URL(href).searchParams.get('page') ?? '';
      expect(new URL(reported).pathname).toBe(new URL(path, baseURL).pathname);
    });
  }

  test('AC14: farm lists and the footer link to the farm section', async ({ page }) => {
    for (const path of ['/fermi', '/plodove/yabalki', '/regioni/plovdiv']) {
      await page.goto(path);
      await expect(page.locator('main a[href="/za-nas#dobavi-ferma"]'), path).toHaveCount(1);
      await expect(page.locator('footer a[href="/za-nas#dobavi-ferma"]'), path).toHaveCount(1);
    }
    await page.goto('/za-nas');
    await expect(
      page.locator('section:has(> h2#dobavi-ferma) a[href*="template=farm.yml"]'),
    ).toHaveCount(1);
  });

  test('AC15: the about page states the limits of its sourcing and that GitHub reports are public', async ({
    page,
  }) => {
    await page.goto('/za-nas');
    await expect(page.locator('main')).toContainText('редакторск');
    await expect(page.locator('section:has(> h2#about-privacy)')).toContainText('GitHub');
    await expect(page.locator('main')).not.toContainText('Всяко твърдение води към източника си');
  });

  test('AC16: names the developer, his profiles and that he checks the data', async ({ page }) => {
    await page.goto('/za-nas');
    const who = page.locator('section:has(> h2#about-who)');
    await expect(who).toContainText(ui.about.who('Марин Попов'));
    await expect(who).toContainText(ui.about.reviewer('Марин Попов'));
    await expect(who.locator('li', { hasText: /^Марин Попов$/ })).toHaveCount(0);
    await expect(who.locator('a[href="https://github.com/desig9stein"]')).toHaveCount(1);
    await expect(
      who.locator('a[href="https://www.linkedin.com/in/marin-popov-65829244"]'),
    ).toHaveCount(1);
  });

  test('AC17: every footer offers an email report and the community is named as a verifier', async ({
    page,
  }) => {
    for (const path of ['/', '/plodove/yabalki']) {
      await page.goto(path);
      await expect(page.locator('footer a[href^="mailto:mspopovv@gmail.com"]'), path).toHaveCount(
        1,
      );
    }
    await page.goto('/za-nas');
    await expect(page.locator('section:has(> h2#greshka)')).toContainText(ui.about.community);
    await expect(page.locator('section:has(> h2#greshka)')).toContainText('остаряла');
  });

  test('AC8: produce sources link to the methodology', async ({ page }) => {
    await page.goto('/plodove/yabalki');
    await expect(page.locator('section:has(> h2#sources) a[href="/metodologiya"]')).toHaveCount(1);
  });

  test('AC9: structured data and titles', async ({ page }) => {
    for (const [path, type] of [
      ['/za-nas', 'AboutPage'],
      ['/metodologiya', 'WebPage'],
    ] as const) {
      await page.goto(path);
      const types = (await jsonLdOf(page)).map((block) => (block as { '@type': string })['@type']);
      expect(types).toEqual(expect.arrayContaining([type, 'BreadcrumbList']));
      expect([...(await page.title())].length).toBeLessThanOrEqual(60);
    }
  });

  for (const path of ['/za-nas', '/metodologiya']) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`AC11: ${path} has no axe violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    test(`AC11: ${path} fits 320 px and reads in order without CSS`, async ({ page }) => {
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
});
