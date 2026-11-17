import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const APPLES = '/plodove/yabalki';
const RAMSONS = '/zelenchutsi/levurda';
const WILD = '/divorastyashti';
const AUGUST = '/sezon/avgust';
const CALENDAR = '/kalendar';
const FARMS = '/fermi';
const SEARCH = '/tarsene';
const VITAMIN_C = '/nutrienti/vitamin-c';
const SUBSCRIBE = '/abonament';
const NIGHTSHADES = '/grupi/kartofovi';
const RECIPE = '/retsepti/sladko-ot-yabalki';
const PROFILE_ONLY_FARM = '/fermi/fermata-na-kris-i-maria';
const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 800 };
const NARROW_PHONE = { width: 320, height: 800 };
/** Chromium's default standard and fixed-width text sizes, in px. */
const DEFAULT_TEXT_SIZE = 16;
const DEFAULT_FIXED_TEXT_SIZE = 13;
const ZOOM_WIDTH = 640;

/** Opens the search page with `query` and waits for the status to report the outcome. */
async function searchFor(page: Page, query: string): Promise<void> {
  await page.goto(`${SEARCH}?q=${encodeURIComponent(query)}`);
  await expect(page.getByRole('status')).toContainText(query);
}

/** Returns the hrefs of the result links in order. */
async function resultLinks(page: Page): Promise<string[]> {
  return page
    .locator('[data-search-results] a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
}

/** Doubles the browser's default text sizes (Chromium only). */
async function doubleTextSize(page: Page): Promise<void> {
  const session = await page.context().newCDPSession(page);
  await session.send('Page.setFontSizes', {
    fontSizes: { standard: DEFAULT_TEXT_SIZE * 2, fixed: DEFAULT_FIXED_TEXT_SIZE * 2 },
  });
}

test.describe('screen-reader and keyboard fixes (spec 062)', () => {
  test('AC1: the month page legend comes before the list, and strips start with the year', async ({
    page,
  }) => {
    await page.goto(AUGUST);
    const order = await page.evaluate(() => {
      const legend = document.querySelector('.season-legend');
      const list = document.querySelector('.season-list');
      return legend !== null && list !== null
        ? legend.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING
        : 0;
    });
    expect(order).toBeTruthy();
    await expect(page.locator('.season-list .year-strip').first()).toHaveAttribute(
      'aria-label',
      /^През годината: /,
    );
  });

  test('AC3: a table that fits is no Tab stop; one that overflows stays a named region', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(APPLES);
    const nutrition = page.locator('.table-scroll').first();
    await expect(nutrition).not.toHaveAttribute('tabindex', /.*/);
    await expect(nutrition).not.toHaveAttribute('aria-label', /.*/);
    await page.setViewportSize(PHONE);
    await page.goto(CALENDAR);
    const calendar = page.locator('.table-scroll').first();
    await expect(calendar).toHaveAttribute('tabindex', '0');
    await expect(calendar).toHaveAttribute('aria-label', /\(превъртане\)$/);
  });

  test('AC3: without JavaScript every scroll table stays focusable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: DESKTOP });
    const page = await context.newPage();
    await page.goto(APPLES);
    await expect(page.locator('.table-scroll').first()).toHaveAttribute('tabindex', '0');
    await context.close();
  });

  test('AC4: on a produce page only h2 sections are named regions', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(APPLES);
    const named = await page.evaluate(() =>
      [...document.querySelectorAll('main section')]
        .filter(
          (section) =>
            section.hasAttribute('aria-labelledby') || section.hasAttribute('aria-label'),
        )
        .map((section) => {
          const id = section.getAttribute('aria-labelledby');
          const heading = id === null ? null : document.getElementById(id);
          return heading?.tagName ?? section.className;
        }),
    );
    expect(named.length).toBeGreaterThan(0);
    for (const tag of named) expect(tag).toBe('H2');
  });

  test('AC5: in-page links move the keyboard focus to their target', async ({ page }) => {
    const cases = [
      { path: APPLES, link: page.locator('.produce__toc a[href="#sources"]'), target: 'sources' },
      {
        path: CALENDAR,
        link: page.locator('.calendar-toc a').nth(1),
        target: 'kalendar-zelenchutsi',
      },
      {
        path: FARMS,
        link: page.locator('.farms__regions a[href="#oblast-plovdiv"]'),
        target: 'oblast-plovdiv',
      },
      { path: '/', link: page.locator('.home-months a[href="#mesetsi"]'), target: 'mesetsi' },
    ];
    for (const { path, link, target } of cases) {
      await page.goto(path);
      await expect(page.locator(`#${target}`), path).toHaveAttribute('tabindex', '-1');
      await link.focus();
      await page.keyboard.press('Enter');
      await expect.poll(() => page.evaluate(() => document.activeElement?.id), path).toBe(target);
    }
  });

  test('AC6: search results have a heading and the title names the query', async ({ page }) => {
    await page.goto(SEARCH);
    await expect(page.getByRole('heading', { level: 2, name: 'Резултати' })).toBeHidden();
    await searchFor(page, 'ябълка');
    await expect(page.getByRole('heading', { level: 2, name: 'Резултати' })).toBeVisible();
    await expect(page).toHaveTitle(/ябълка/);
  });

  test('AC7: the water-bath steps are an ordered list', async ({ page }) => {
    await page.goto(RECIPE);
    await expect(page.locator('#water-bath + ol li').first()).toBeVisible();
  });

  test('AC8: with doubled text at 640 px the „% РСП“ column is inside the nutrition box', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ZOOM_WIDTH, height: 800 });
    await doubleTextSize(page);
    await page.goto(APPLES);
    const box = await page.locator('.table-scroll').first().boundingBox();
    const header = await page.locator('table.nutrition thead th').nth(2).boundingBox();
    expect(box).not.toBeNull();
    expect(header).not.toBeNull();
    if (box === null || header === null) return;
    expect(header.x + header.width).toBeLessThanOrEqual(box.x + box.width + 1);
  });
});

test.describe('wild plants (spec 062)', () => {
  test('AC9: the wild plants page lists every wild produce with its season', async ({ page }) => {
    await page.goto(WILD);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Диворастящи растения');
    const rows = page.locator('.wild-list > li');
    expect(await rows.count()).toBeGreaterThanOrEqual(13);
    await expect(rows.first().locator('.year-strip')).toHaveCount(1);
    await expect(page.locator('.wild-list a[href="/plodove/cheren-baz"]')).toHaveCount(1);
    await expect(page.locator(`a[href="${AUGUST}#divorastyashti"]`)).toHaveCount(1);
    await expect(page.locator('nav a[href^="/sezon/"][href$="#divorastyashti"]')).toHaveCount(12);
    await expectNoAxeViolations(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expectNoAxeViolations(page);
  });

  test('AC9: the wild tag links the list on wild produce pages only', async ({ page }) => {
    await page.goto(RAMSONS);
    await expect(page.locator(`.produce__meta a[href="${WILD}"]`)).toHaveText('Диворастящо');
    await page.goto(APPLES);
    await expect(page.locator(`.produce__meta a[href="${WILD}"]`)).toHaveCount(0);
  });

  test('AC9: a month page lists its wild plants in their own section', async ({ page }) => {
    await page.goto(AUGUST);
    const section = page.locator('#divorastyashti');
    await expect(section).toHaveAttribute('tabindex', '-1');
    await expect(page.getByRole('heading', { name: /^Диворастящи през август/ })).toBeVisible();
    await expect(section.locator('a', { hasText: 'Черен бъз' })).toBeVisible();
    await expect(page.locator(`main a[href="${WILD}"]`).first()).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('AC9: search and catalogue link the wild plants page', async ({ page }) => {
    await page.goto(SEARCH);
    await expect(page.locator(`.site-search__browse a[href="${WILD}"]`)).toHaveCount(1);
    await page.goto('/katalog');
    await expect(page.locator(`main a[href="${WILD}"]`)).toHaveCount(1);
  });
});

test.describe('search tuning (spec 062)', () => {
  test('AC10: „нар“ lists the pomegranate first and no page that only has „нарязани“', async ({
    page,
  }) => {
    await searchFor(page, 'нар');
    const links = await resultLinks(page);
    expect(links[0]).toBe('/plodove/nar');
    const texts = await page.locator('[data-search-results] li').allTextContents();
    for (const text of texts) expect(text.toLowerCase()).toMatch(/(^|[^\p{L}])нар/u);
  });

  test('AC11: „чушки“ lists Пипер first', async ({ page }) => {
    await searchFor(page, 'чушки');
    expect((await resultLinks(page))[0]).toBe('/zelenchutsi/piper');
  });

  test('AC12: „семейство домати“ finds the family of tomatoes', async ({ page }) => {
    await searchFor(page, 'семейство домати');
    expect((await resultLinks(page)).slice(0, 3)).toContain(NIGHTSHADES);
  });

  test('AC13: „гъби“ explains what the site covers', async ({ page }) => {
    await searchFor(page, 'гъби');
    await expect(page.getByRole('status')).toContainText('Няма резултати');
    await expect(page.getByRole('status')).toContainText(
      'Сайтът покрива пресни плодове, зеленчуци, билки и ядки от България.',
    );
  });
});

test.describe('phones, subscribe, farms, groups and print (spec 062)', () => {
  for (const viewport of [PHONE, NARROW_PHONE]) {
    test(`AC14: the vitamin C ranking does not overflow at ${viewport.width} px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(VITAMIN_C);
      const overflow = await page
        .locator('.table-scroll')
        .first()
        .evaluate((box) => box.scrollWidth - box.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.getByRole('table')).toHaveCount(1);
      await expect(page.getByRole('rowheader').first()).toBeVisible();
      await expect(page.getByRole('columnheader').first()).toBeAttached();
    });
  }

  test('AC15: the copy button copies the feed address and the field selects on focus', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(SUBSCRIBE);
    await expect(page.locator('main')).toContainText(
      'Копирай адреса от полето и го постави в приложението.',
    );
    const field = page.locator('#feed-address');
    await field.focus();
    const selected = await field.evaluate(
      (input: HTMLInputElement) => (input.selectionEnd ?? 0) - (input.selectionStart ?? 0),
    );
    expect(selected).toBe((await field.inputValue()).length);
    await page.getByRole('button', { name: 'Копирай' }).click();
    await expect(page.locator('.feed-address [role="status"]')).toHaveText('Адресът е копиран.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await field.inputValue(),
    );
  });

  test('AC15: without JavaScript the copy button stays hidden', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(SUBSCRIBE);
    await expect(page.locator('[data-copy-feed]')).toBeHidden();
    await context.close();
  });

  test('AC16: the farm list marks organic farms and points from Sofia city to Sofia province', async ({
    page,
  }) => {
    await page.goto(FARMS);
    await expect(page.locator('.farms__organic a[href="/fermi/vkusnagradina"]')).toHaveCount(1);
    await expect(
      page.locator('.farm').filter({ hasText: 'ВКУСнаГРАДИНА' }).locator('.farm-label'),
    ).toContainText('Био');
    await expect(
      page.locator('#oblast-sofia-grad').locator('..').locator('a[href="#oblast-sofiyska"]'),
    ).toHaveText(/^Ферми в Софийска област \(\d+\)$/);
    await page.goto(PROFILE_ONLY_FARM);
    await expect(page.locator('main')).toContainText(
      'За връзка с фермата отвори профила ѝ в LocalStore.bg.',
    );
  });

  test('AC18: a family page starts with what is in season', async ({ page }) => {
    await page.goto(NIGHTSHADES);
    const headings = await page
      .locator('main h2, main h3')
      .evaluateAll((items) => items.map((item) => `${item.tagName} ${item.textContent?.trim()}`));
    expect(headings[0]).toMatch(/^H2 В сезон през \S+ \(\d+\)$/);
    const outOfSeason = headings.findIndex((text) => text.startsWith('H2 Извън сезона през'));
    expect(outOfSeason).toBeGreaterThan(0);
    for (const heading of headings.slice(1, outOfSeason)) {
      expect(heading.startsWith('H3') || heading.startsWith('H4')).toBe(true);
    }
    await expectNoAxeViolations(page);
  });

  test('AC19: the printed calendar has no print instruction and a key in every table head', async ({
    page,
  }) => {
    await page.goto(CALENDAR);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.calendar-print-hint')).toBeHidden();
    const tables = page.locator('table.year');
    const count = await tables.count();
    expect(count).toBeGreaterThan(1);
    for (let index = 0; index < count; index += 1) {
      const key = tables.nth(index).locator('thead tr.year__key');
      await expect(key).toHaveAttribute('aria-hidden', 'true');
      await expect(key).toBeVisible();
    }
  });
});
