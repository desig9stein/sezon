import { expect, test } from '@playwright/test';

test.describe('typography', () => {
  test('AC5: headings use Piazzolla, text uses Sofia Sans, both loaded from the site', async ({
    page,
  }) => {
    const fontRequests: string[] = [];
    page.on('request', (request) => {
      if (request.resourceType() === 'font') fontRequests.push(request.url());
    });
    await page.goto('/zelenchutsi/zele');
    await page.evaluate(() => document.fonts.ready);

    const families = await page.evaluate(() => ({
      heading: getComputedStyle(document.querySelector('h1') as Element).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
    }));
    expect(families.heading).toMatch(/Piazzolla/);
    expect(families.body).toMatch(/Sofia Sans/);

    const loaded = await page.evaluate(() => {
      const firstFamily = (element: Element) => getComputedStyle(element).fontFamily.split(',')[0];
      const display = firstFamily(document.querySelector('h1') as Element);
      const base = firstFamily(document.body);
      return {
        display: document.fonts.check(`600 32px ${display}`, 'Зеле'),
        base: document.fonts.check(`400 16px ${base}`, 'Есенното зеле'),
      };
    });
    expect(loaded).toEqual({ display: true, base: true });

    expect(fontRequests.length).toBeGreaterThan(0);
    const origin = new URL(page.url()).origin;
    for (const url of fontRequests) {
      expect(url.startsWith(`${origin}/_astro/fonts/`)).toBe(true);
    }
  });
});
