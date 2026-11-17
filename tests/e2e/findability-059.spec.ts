import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

/** Returns the source-order index of the first element matching each selector in `main`. */
async function sourceOrder(page: Page, selectors: ReadonlyArray<string>): Promise<number[]> {
  return page.evaluate((list) => {
    const all = [...document.querySelectorAll('main *')];
    return list.map((selector) => {
      const element = document.querySelector(`main ${selector}`);
      return element === null ? -1 : all.indexOf(element);
    });
  }, selectors);
}

test.describe('findability (spec 059)', () => {
  test('AC2: the home page explains the stamps before the list and has no contradiction', async ({
    page,
  }) => {
    await page.goto('/');
    const [intro, legend, list] = await sourceOrder(page, [
      '.home-intro',
      '.season-legend',
      '.season-list',
    ]);
    expect(intro).toBeGreaterThan(-1);
    expect(intro).toBeLessThan(legend ?? -1);
    expect(legend).toBeLessThan(list ?? -1);
    await expect(page.locator('main')).not.toContainText('Няма данни за този месец.');
  });

  test('AC3: the home page links other months right under its heading', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('main').getByRole('navigation', { name: 'Други месеци' });
    await expect(nav).toBeVisible();
    const hrefs = await nav
      .locator('a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs).toHaveLength(3);
    expect(hrefs[0]).toMatch(/^\/sezon\//);
    expect(hrefs[1]).toMatch(/^\/sezon\//);
    expect(hrefs[2]).toBe('#mesetsi');
    const [heading, months, list] = await sourceOrder(page, [
      'h1',
      'nav[aria-label="Други месеци"]',
      '.season-list',
    ]);
    expect(heading).toBeLessThan(months ?? -1);
    expect(months).toBeLessThan(list ?? -1);
    await expect(page.locator('footer nav#mesetsi')).toHaveCount(1);
  });

  test('AC15: the farm list is grouped by province with jump links', async ({ page }) => {
    await page.goto('/fermi');
    const jump = page.getByRole('navigation', { name: 'Ферми по области' });
    const targets = await jump
      .locator('a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(targets.length).toBeGreaterThan(5);
    for (const target of targets) {
      expect(target).toMatch(/^#oblast-[a-z-]+$/);
      const section = page.locator(`section:has(> h2${target})`);
      await expect(section).toHaveCount(1);
      expect(await section.locator('.farm').count()).toBeGreaterThan(0);
    }
    const sectioned = await page.locator('main section:has(> h2[id^="oblast-"]) .farm').count();
    expect(sectioned).toBe(await page.locator('main .farm').count());
    await expect(page.locator('#oblast-plovdiv')).toContainText('Пловдив');
    await expect(
      page.locator(
        'section:has(> h2#oblast-plovdiv) .farm__name a[href="/fermi/gradina-dzhumerski"]',
      ),
    ).toHaveCount(1);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC15/AC17: /fermi and /kalendar have no axe violations in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      for (const path of ['/fermi', '/kalendar', '/']) {
        await page.goto(path);
        await expectNoAxeViolations(page);
      }
    });
  }

  test('AC17: the calendar is truthful about printing and has one heading per kind', async ({
    page,
  }) => {
    await page.goto('/kalendar');
    await expect(page.locator('.calendar-intro')).toContainText('няколко листа A4');
    await expect(page.locator('main')).not.toContainText('подготвен за разпечатване');
    const headings = await page.locator('main h2').allTextContents();
    expect(headings.map((text) => text.trim())).toEqual(
      expect.arrayContaining(['Плодове', 'Зеленчуци', 'Подправки', 'Ядки']),
    );
    const jump = page.getByRole('navigation', { name: 'На тази страница' });
    await expect(jump.locator('a[href="#kalendar-plodove"]')).toHaveCount(1);
    await expect(page.locator('.calendar-kind table')).toHaveCount(4);
  });

  test('AC6: at 390 px the five header links share one row of 44px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page
      .locator('.site-header__nav a')
      .evaluateAll((links) =>
        links.map((link) => ({ top: link.getBoundingClientRect().top, height: link.offsetHeight })),
      );
    expect(boxes).toHaveLength(5);
    expect(new Set(boxes.map((box) => Math.round(box.top))).size).toBe(1);
    for (const box of boxes) expect(box.height).toBeGreaterThanOrEqual(44);
    const header = await page.locator('body > header').boundingBox();
    expect(header?.height ?? Infinity).toBeLessThanOrEqual(100);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('AC16: the feed opens as a readable Bulgarian page in the browser', async ({ page }) => {
    await page.goto('/rss.xml');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toContainText('Какво е RSS');
    expect(await page.locator('a[href*="/sezon/"]').count()).toBe(12);
  });
});
