import { expect, test } from '@playwright/test';

test('QA 005: the current month link shows the focus outline when focused', async ({ page }) => {
  await page.goto('/zelenchutsi/spanak');
  const current = page.locator('main a[aria-current="date"]');
  const focusColour = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-focus').trim(),
  );
  await current.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const outline = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return { colour: style.outlineColor, width: style.outlineWidth };
  });
  const expected = await page.evaluate((hex) => {
    const probe = document.createElement('span');
    probe.style.color = hex;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, focusColour);
  expect(outline.colour).toBe(expected);
  expect(outline.width).toBe('3px');
});
