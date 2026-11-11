import { expect, test } from '@playwright/test';

test.describe('stamp-of-origin typography (spec 022)', () => {
  test('AC5: the title is condensed capitals and the Latin name is Sofia Sans italic', async ({
    page,
  }) => {
    await page.goto('/plodove/yabalki');
    await page.evaluate(() => document.fonts.ready);
    const styles = await page.evaluate(() => {
      const style = (selector: string) =>
        getComputedStyle(document.querySelector(selector) as Element);
      const h1 = style('h1');
      const latin = style('[lang="la"]');
      return {
        heading: h1.fontFamily,
        transform: h1.textTransform,
        weight: h1.fontWeight,
        latin: latin.fontFamily,
        latinStyle: latin.fontStyle,
      };
    });
    expect(styles.heading).toMatch(/^"?Sofia Sans Extra Condensed/);
    expect(styles.transform).toBe('uppercase');
    expect(styles.weight).toBe('800');
    expect(styles.latin).toMatch(/^"?Sofia Sans"?(,|$)/);
    expect(styles.latinStyle).toBe('italic');
  });
});
