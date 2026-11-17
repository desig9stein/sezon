import { expect, test, type Page } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const APPLES = '/plodove/yabalki';
const RAMSONS = '/zelenchutsi/levurda';
const NETTLE = '/zelenchutsi/kopriva';
const RECIPE = '/retsepti/sladko-ot-yabalki';
const VITAMIN_C = '/nutrienti/vitamin-c';
const CALENDAR = '/kalendar';
const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 800;
/** Wide enough that the doubled text does not reflow the home list into its narrow layout. */
const WIDE_VIEWPORT = { width: 1280, height: 800 };
const MIN_TARGET = 24;
const MAX_TAB_STOPS = 400;
const STOP_ATTRIBUTE = 'data-e2e-stop';

interface FocusStyle {
  readonly outline: string;
  readonly boxShadow: string;
}

interface TabStop {
  readonly index: number;
  readonly label: string;
  readonly href: string | null;
  /** Whether the stop is in the produce page's „Откъде“ section (list and map). */
  readonly inRegions: boolean;
  readonly focused: FocusStyle;
}

/**
 * Tabs through every focusable element inside `main`, starting at `main`, and returns each stop
 * with its focused outline and box-shadow. Each stop is marked with {@link STOP_ATTRIBUTE}.
 */
async function tabStopsInMain(page: Page): Promise<TabStop[]> {
  await page.locator('main').focus();
  const stops: TabStop[] = [];
  for (let index = 0; index < MAX_TAB_STOPS; index += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(
      ({ index: position, attribute }) => {
        const active = document.activeElement;
        if (!(active instanceof Element) || active.closest('main') === null) return undefined;
        active.setAttribute(attribute, String(position));
        const style = getComputedStyle(active);
        return {
          index: position,
          label: (active.textContent ?? '').trim().slice(0, 60) || active.outerHTML.slice(0, 80),
          href: active.getAttribute('href'),
          inRegions: active.closest('section[aria-labelledby="regions"]') !== null,
          focused: {
            outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
            boxShadow: style.boxShadow,
          },
        };
      },
      { index, attribute: STOP_ATTRIBUTE },
    );
    if (stop === undefined) break;
    stops.push(stop);
  }
  return stops;
}

/** Returns the unfocused outline and box-shadow of each marked stop, by index. */
async function unfocusedStyles(page: Page): Promise<Record<string, FocusStyle>> {
  await page.locator('main').focus();
  return page.evaluate((attribute) => {
    const styles: Record<string, FocusStyle> = {};
    for (const element of document.querySelectorAll(`[${attribute}]`)) {
      const style = getComputedStyle(element);
      styles[element.getAttribute(attribute) ?? ''] = {
        outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
        boxShadow: style.boxShadow,
      };
    }
    return styles;
  }, STOP_ATTRIBUTE);
}

const visibleOutline = (style: FocusStyle) =>
  !style.outline.startsWith('none') && !/ 0px /.test(` ${style.outline} `);

test.describe('accessibility polish (spec 060)', () => {
  test('AC1: every Tab stop in main shows a focus indicator it does not show unfocused', async ({
    page,
  }) => {
    await page.goto(APPLES);
    const stops = await tabStopsInMain(page);
    expect(stops.length).toBeGreaterThan(10);
    expect(stops.some((stop) => stop.label.includes('Natural Earth'))).toBe(true);
    const unfocused = await unfocusedStyles(page);
    const invisible = stops
      .filter((stop) => {
        const before = unfocused[String(stop.index)];
        const changed =
          before === undefined ||
          before.outline !== stop.focused.outline ||
          before.boxShadow !== stop.focused.boxShadow;
        const shows = visibleOutline(stop.focused) || stop.focused.boxShadow !== 'none';
        return !(changed && shows);
      })
      .map((stop) => stop.label);
    expect(invisible).toEqual([]);
  });

  test('AC8: region pages and the nutrition source are single Tab stops on a produce page', async ({
    page,
  }) => {
    await page.goto(APPLES);
    const stops = await tabStopsInMain(page);
    const hrefs = stops.flatMap((stop) => (stop.href === null ? [] : [stop.href]));
    const regionHrefs = stops.flatMap((stop) =>
      stop.inRegions && stop.href?.startsWith('/regioni/') === true ? [stop.href] : [],
    );
    expect(regionHrefs.length).toBeGreaterThan(0);
    expect(new Set(regionHrefs).size).toBe(regionHrefs.length);
    const usda = hrefs.filter((href) => href.includes('fdc.nal.usda.gov'));
    expect(usda).toHaveLength(1);
    const mapLinks = page.locator('figure.province-map svg a');
    await expect(mapLinks.first()).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('figure.province-map svg g[data-links]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expectNoAxeViolations(page);
  });

  test('AC4: English source titles carry lang="en"', async ({ page }) => {
    const checks: ReadonlyArray<[string, RegExp]> = [
      [APPLES, /^USDA FoodData Central/],
      [RAMSONS, /^(Razinger|Hermanns-Clausen)/],
      [RECIPE, /^National Center for Home Food Preservation/],
    ];
    for (const [path, title] of checks) {
      await page.goto(path);
      const langs = await page
        .locator('main a, main cite')
        .evaluateAll(
          (elements, pattern) =>
            elements
              .filter((element) => new RegExp(pattern).test((element.textContent ?? '').trim()))
              .map((element) => element.getAttribute('lang')),
          title.source,
        );
      expect(langs.length, path).toBeGreaterThan(0);
      expect(new Set(langs), path).toEqual(new Set(['en']));
    }
  });

  test('AC5: the in-season column of the vitamin C table is visible on a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
    await page.goto(VITAMIN_C);
    const box = await page.locator('.table-scroll').first().boundingBox();
    const cell = page.locator('.table-scroll tbody tr').first().locator('td').first();
    const cellBox = await cell.boundingBox();
    expect(box).not.toBeNull();
    expect(cellBox).not.toBeNull();
    if (box && cellBox) expect(cellBox.x + cellBox.width).toBeLessThanOrEqual(box.x + box.width);
    await expect(page.locator('.table-scroll thead th').nth(1)).toHaveText(/^През /);
  });

  test('AC9: the home year strip doubles with the root font size', async ({ page }) => {
    await page.setViewportSize(WIDE_VIEWPORT);
    await page.goto('/');
    const strip = page.locator('.year-strip').first();
    const before = (await strip.boundingBox())?.height ?? 0;
    await page.evaluate(() => {
      const root = document.documentElement;
      root.style.fontSize = `${parseFloat(getComputedStyle(root).fontSize) * 2}px`;
    });
    const after = (await strip.boundingBox())?.height ?? 0;
    expect(before).toBeGreaterThan(0);
    expect(after / before).toBeCloseTo(2, 1);
  });

  test('AC11: a produce without farms has no contents link to the farm section', async ({
    page,
  }) => {
    await page.goto(NETTLE);
    await expect(page.locator('.produce__toc a[href="#farms"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Местни ферми, които го продават' })).toHaveCount(
      0,
    );
    await expect(page.locator('#farms')).toBeVisible();
    await expect(page.getByText('Все още няма добавени ферми за този продукт.')).toBeVisible();
    await expect(page.locator('main a[href="/za-nas#dobavi-ferma"]')).toBeVisible();
    await page.goto(APPLES);
    await expect(page.locator('.produce__toc a[href="#farms"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Местни ферми, които го продават' })).toHaveCount(
      1,
    );
  });

  test('AC12: table and region-list links are at least 24 px tall', async ({ page }) => {
    const checks: ReadonlyArray<[string, string]> = [
      [CALENDAR, '.table-scroll th a'],
      [VITAMIN_C, '.table-scroll th a'],
      [APPLES, '.table-scroll th a'],
      [APPLES, 'section[aria-labelledby="regions"] > ul a'],
    ];
    for (const [path, selector] of checks) {
      await page.goto(path);
      const heights = await page
        .locator(selector)
        .evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
      expect(heights.length, `${path} ${selector}`).toBeGreaterThan(0);
      expect(Math.min(...heights), `${path} ${selector}`).toBeGreaterThanOrEqual(MIN_TARGET);
    }
  });
});
