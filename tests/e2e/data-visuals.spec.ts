import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';
import { removeAllCss } from './noCss';

const PAGE = '/zelenchutsi/morkovi';

test.describe('data visuals (spec 026)', () => {
  test('AC9: the map follows the region list and the garden row is in the season section', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const regions = page.locator('section:has(> h3#regions)');
    await expect(regions.locator('ul + figure.province-map svg[role="group"]')).toHaveCount(1);
    await expect(
      page.locator('section:has(> h3#season)').getByRole('list', { name: 'В градината' }),
    ).toHaveCount(1);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC9: no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE);
      await expectNoAxeViolations(page);
    });
  }

  test('AC10: no horizontal scroll at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PAGE);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('AC10: the map stays at most 320 px wide without CSS', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(PAGE);
    await removeAllCss(page);
    const box = await page.locator('figure.province-map svg').boundingBox();
    expect(box?.width).toBeLessThanOrEqual(320);
  });
});

test('AC13: printed garden cells carry no coloured frame', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await page.goto(PAGE);
  const shadows = await page
    .locator('.calendar--garden .calendar__month')
    .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).boxShadow));
  expect(shadows.every((shadow) => shadow === 'none')).toBe(true);
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`AC13: active garden cells have no frame on screen (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto(PAGE);
    const active = page.locator('.calendar--garden .calendar__month[data-active="true"]');
    expect(await active.count()).toBeGreaterThan(0);
    const styles = await active.evaluateAll((cells) =>
      cells.map((cell) => ({
        shadow: getComputedStyle(cell).boxShadow,
        weight: getComputedStyle(cell.querySelector('.calendar__level') ?? cell).fontWeight,
      })),
    );
    for (const style of styles) {
      expect(style.shadow).toBe('none');
      expect(Number(style.weight)).toBeGreaterThanOrEqual(700);
    }
  });

  test(`AC14: province borders use the border colour (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto(PAGE);
    const [stroke, border] = await page.evaluate(() => {
      const svg = document.querySelector('figure.province-map svg');
      const probe = document.createElement('div');
      probe.style.color = 'var(--color-border)';
      document.body.append(probe);
      return [svg === null ? '' : getComputedStyle(svg).stroke, getComputedStyle(probe).color];
    });
    expect(stroke).toBe(border);
  });
}
