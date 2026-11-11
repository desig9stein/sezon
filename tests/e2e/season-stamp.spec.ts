import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const FIRST_ROWS = 10;
const LEGEND = [
  'Разгар — прясно от полето',
  'В сезон',
  'От хранилище — от последната бера',
  'Извън сезона — вероятно е внос',
];

test.describe('season stamp and in-season list (spec 024)', () => {
  test('AC4: the home page opens on the in-season list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByText(/Табло/)).toHaveCount(0);
    await expect(page.locator('main').getByRole('navigation', { name: 'Месеци' })).toHaveCount(0);
    await expect(page.locator('h1')).toContainText(
      /(януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември)/i,
    );
    const legend = page.locator('.season-legend');
    for (const entry of LEGEND) await expect(legend).toContainText(entry);
    const bottoms = await page
      .locator('.season-list li')
      .evaluateAll(
        (rows, count) => rows.slice(0, count).map((row) => row.getBoundingClientRect().bottom),
        FIRST_ROWS,
      );
    expect(bottoms.length).toBeGreaterThan(0);
    for (const bottom of bottoms) expect(bottom).toBeLessThanOrEqual(844);
  });

  test('AC5: a month page shows the list, the legend and the pager', async ({ page }) => {
    await page.goto('/sezon/noemvri');
    await expect(page.locator('.season-list li').first()).toBeVisible();
    await expect(page.locator('.season-legend')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Други месеци' })).toBeVisible();
  });

  for (const scheme of ['light', 'dark'] as const) {
    test(`AC6: home and a month page pass axe (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const path of ['/', '/sezon/noemvri']) {
        await page.goto(path);
        await expectNoAxeViolations(page);
      }
    });
  }

  test('AC6: stamps print in ink', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.goto('/');
    const colors = await page
      .locator('.season-stamp')
      .evaluateAll((stamps) => stamps.map((stamp) => getComputedStyle(stamp).color));
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.filter((color) => color !== 'rgb(0, 0, 0)')).toEqual([]);
  });

  for (const width of [320, 390]) {
    test(`AC3: season rows never overlap, even with a long name, at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/sezon/noemvri');
      await page.evaluate(() => document.fonts.ready);
      await page
        .locator('.season-row__name')
        .first()
        .evaluate((link) => {
          link.textContent = 'Брюкселско зеле (кълнове) от планината';
        });
      const overlaps = await page.locator('.season-row').evaluateAll((rows) =>
        rows.flatMap((row) => {
          const boxes = [...row.children].map((child) => child.getBoundingClientRect());
          return boxes.flatMap((a, i) =>
            boxes
              .slice(i + 1)
              .filter(
                (b) =>
                  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
                  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5,
              )
              .map(() => row.textContent?.trim().slice(0, 20)),
          );
        }),
      );
      expect(overlaps).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  }
});
