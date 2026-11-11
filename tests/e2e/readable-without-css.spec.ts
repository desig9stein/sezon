import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';
import { hiddenByCss, removeAllCss, reorderedByCss } from './noCss';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'month', path: '/sezon/noemvri' },
  { name: 'section', path: '/zelenchutsi' },
  { name: 'produce', path: '/zelenchutsi/zele' },
  { name: 'nutrient', path: '/nutrienti/vitamin-c' },
  { name: 'calendar', path: '/kalendar' },
  { name: 'search', path: '/tarsene' },
  { name: 'not found', path: '/404' },
] as const;

const MAX_ICON_SIZE = 128;

/** WCAG 2.5.8 exempts targets whose size the user agent sets, which is every target without CSS. */
const RULES_EXEMPT_WITHOUT_CSS = ['target-size'] as const;

/** Returns the heading levels (1–6) of the page in document order. */
const headingLevels = (page: Page): Promise<number[]> =>
  page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));

for (const { name, path } of PAGES) {
  test.describe(`${name} page (${path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('AC1: CSS hides nothing except visually hidden or [hidden] content', async ({ page }) => {
      expect(await hiddenByCss(page)).toEqual([]);
    });

    test('AC2: CSS does not reorder content', async ({ page }) => {
      expect(await reorderedByCss(page)).toEqual([]);
    });

    test('AC3: no element has a positive tabindex', async ({ page }) => {
      const positive = await page
        .locator('[tabindex]')
        .evaluateAll((elements) =>
          elements
            .filter((element) => Number(element.getAttribute('tabindex')) > 0)
            .map((element) => element.outerHTML.slice(0, 80)),
        );
      expect(positive).toEqual([]);
    });

    test('AC4: without CSS the reading order is skip link, header, navigation, main, footer', async ({
      page,
    }) => {
      await removeAllCss(page);

      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.activeElement?.getAttribute('href'))).toBe('#main');

      const inOrder = await page.evaluate(() => {
        const landmarks = [
          document.querySelector('body > header'),
          document.querySelector('body > header nav[aria-label]'),
          document.querySelector('body > main#main'),
          document.querySelector('body > main#main ~ footer'),
        ];
        if (landmarks.some((landmark) => landmark === null)) return false;
        return landmarks.every((landmark, index) => {
          const next = landmarks[index + 1];
          return (
            next === undefined ||
            next === null ||
            landmark === null ||
            (landmark.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
          );
        });
      });
      expect(inOrder).toBe(true);

      await expect(page.locator('h1')).toHaveCount(1);
      expect(
        await page
          .locator(':is(h1, h2, h3, h4, h5, h6)')
          .first()
          .evaluate((h) => h.tagName),
      ).toBe('H1');
      await expect(page.locator('main#main h1')).toHaveCount(1);
      const levels = await headingLevels(page);
      const skips = levels.filter(
        (level, index) => index > 0 && level > (levels[index - 1] ?? 0) + 1,
      );
      expect(skips).toEqual([]);
    });

    test('AC5: without CSS media stays small and the desktop page does not scroll sideways', async ({
      page,
    }, testInfo) => {
      await removeAllCss(page);

      const oversized = await page
        .locator('img, svg, video, iframe, object, embed, canvas')
        .evaluateAll(
          (elements, max) =>
            elements
              .filter(
                (element) =>
                  !['width', 'height'].every((name) =>
                    /^\d+$/.test(element.getAttribute(name) ?? ''),
                  ),
              )
              .filter((element) => {
                const box = element.getBoundingClientRect();
                return box.width > max || box.height > max;
              })
              .map((element) => element.outerHTML.slice(0, 80)),
          MAX_ICON_SIZE,
        );
      expect(oversized).toEqual([]);

      if (testInfo.project.name === 'desktop') {
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      }
    });

    test('AC6: without CSS axe reports no violations (target size is set by the browser)', async ({
      page,
    }) => {
      await removeAllCss(page);
      await expectNoAxeViolations(page, RULES_EXEMPT_WITHOUT_CSS);
    });
  });
}

test('AC8: without CSS the produce facts under the title are separate list items', async ({
  page,
}) => {
  await page.goto('/zelenchutsi/zele');
  await removeAllCss(page);

  const facts = page.locator('article header ul > li');
  await expect(facts).toHaveCount(3);
  await expect(facts.nth(0).locator('i[lang="la"]')).toHaveText('Brassica oleracea var. capitata');
  await expect(facts.nth(2)).toContainText('Brassicaceae');
  const tops = await facts.evaluateAll((items) =>
    items.map((item) => Math.round(item.getBoundingClientRect().top)),
  );
  expect(new Set(tops).size).toBe(3);
});

test('AC8: with CSS the produce facts stay on one wrapping row on desktop', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one row needs the desktop width');
  await page.goto('/zelenchutsi/zele');

  const tops = await page
    .locator('article header ul > li')
    .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
});
