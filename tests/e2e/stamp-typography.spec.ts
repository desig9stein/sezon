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
    expect(styles.latin).toMatch(/^"?Sofia Sans(-[0-9a-f]+)?"?,/);
    expect(styles.latinStyle).toBe('italic');
  });

  test('QA 022: the logo is upright condensed capitals, never a synthesised italic', async ({
    page,
  }) => {
    await page.goto('/');
    const logo = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.site-header__logo') as Element);
      return { style: style.fontStyle, transform: style.textTransform, weight: style.fontWeight };
    });
    expect(logo).toEqual({ style: 'normal', transform: 'uppercase', weight: '800' });
  });
});
