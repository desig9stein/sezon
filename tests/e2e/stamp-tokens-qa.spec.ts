import { expect, test } from '@playwright/test';

const WHITE = 'rgb(255, 255, 255)';

test.describe('stamp-of-origin tokens, QA 022', () => {
  test('QA 022: „Разгар“ badges and calendar tiles print in dark ink', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.goto('/plodove/yabalki');
    const colors = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          ".season-badge[data-level='peak'], .calendar__month[data-level='peak'] a",
        ),
      ].map((element) => getComputedStyle(element).color),
    );
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.filter((color) => color === WHITE)).toEqual([]);
  });

  test('QA 022: a focused calendar tile has a background halo inside its focus ring', async ({
    page,
  }) => {
    await page.goto('/plodove/yabalki');
    const tile = page.locator(".calendar__month[data-level='peak'] a").first();
    await tile.focus();
    const shadow = await tile.evaluate((element) => getComputedStyle(element).boxShadow);
    expect(shadow).not.toBe('none');
  });

  test('QA 022: headings never use negative tracking or mixed case', async ({ page }) => {
    for (const path of ['/', '/plodove/yabalki']) {
      await page.goto(path);
      const h1 = await page.evaluate(() => {
        const style = getComputedStyle(document.querySelector('h1 .hero__month, h1') as Element);
        return { transform: style.textTransform, spacing: parseFloat(style.letterSpacing) || 0 };
      });
      expect(h1.transform, path).toBe('uppercase');
      expect(h1.spacing, path).toBeGreaterThanOrEqual(0);
    }
  });
});
