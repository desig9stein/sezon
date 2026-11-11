import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const APPLES = '/plodove/yabalki';
const SECOND_SCREEN_BOTTOM = 1688;

const headingsOf = (page: Page, level: string, scope = 'main') =>
  page
    .locator(`${scope} ${level}`)
    .evaluateAll((items) => items.map((item) => item.textContent?.replace(/\s+/g, ' ').trim()));

test.describe('produce page groups (spec 025)', () => {
  test('AC1: the h2 groups are in order', async ({ page }) => {
    await page.goto(APPLES);
    const h2 = await headingsOf(page, 'h2', 'article.produce');
    expect(h2).toEqual([
      'На сергията',
      'Яж',
      'Отгледай',
      'Местни ферми',
      'Често задавани въпроси',
      'Източници',
    ]);
  });

  test('AC2: the stall group opens with the current level and the shopper sections', async ({
    page,
  }) => {
    await page.goto(APPLES);
    const stall = page.locator('section#stall');
    await expect(stall.locator('.produce-now .season-stamp, .produce-now__none')).toHaveCount(1);
    const h3 = await headingsOf(page, 'h3', 'section#stall');
    expect(h3).toEqual([
      'Сезон по месеци',
      'Как да избереш',
      'Как да съхраниш',
      'Сортове',
      'Откъде',
    ]);
  });

  test('AC3: the table of contents links to every group in page order', async ({ page }) => {
    await page.goto(APPLES);
    const toc = page.getByRole('navigation', { name: 'На тази страница' });
    const hrefs = await toc
      .locator('a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    const ids = await page
      .locator('article.produce h2')
      .evaluateAll((headings) =>
        headings.map((heading) => `#${heading.closest('section')?.id || heading.id}`),
      );
    expect(hrefs).toEqual(ids);
    for (const href of hrefs) await expect(page.locator(href ?? '#missing')).toHaveCount(1);
  });

  test('AC4: the level and how to choose come within two phone screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(APPLES);
    for (const selector of ['.produce-now', 'h3:text-is("Как да избереш")']) {
      const box = await page.locator(selector).first().boundingBox();
      expect(box?.y ?? Infinity, selector).toBeLessThan(SECOND_SCREEN_BOTTOM);
    }
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`AC5: produce pages pass axe and never skip heading levels (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const path of [APPLES, '/zelenchutsi/zele', '/podpravki/kopar']) {
        await page.goto(path);
        const levels = await page
          .locator('main :is(h1,h2,h3,h4)')
          .evaluateAll((items) => items.map((item) => Number(item.tagName.slice(1))));
        levels.forEach((level, index) => {
          if (index > 0) expect(level - (levels[index - 1] ?? level), path).toBeLessThanOrEqual(1);
        });
        await expectNoAxeViolations(page);
      }
    });
  }

  test('QA 025: the level comes before the season heading, and the stall links to the farms', async ({
    page,
  }) => {
    await page.goto(APPLES);
    const before = await page.evaluate(() => {
      const now = document.querySelector('.produce-now');
      const season = document.querySelector('h3#season');
      return now !== null && season !== null
        ? (now.compareDocumentPosition(season) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
        : false;
    });
    expect(before).toBe(true);
    await expect(page.locator('section#stall a[href="#farms"]')).toHaveCount(1);
  });

  test('QA 025: the table of contents is not printed', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.goto(APPLES);
    await expect(page.locator('nav.produce__toc')).toBeHidden();
  });
});
