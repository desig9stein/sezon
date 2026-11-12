import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './a11y';

const PAGE = '/sezon/noemvri';

test.describe('month changes (spec 027)', () => {
  test('AC9: the block follows the legend and precedes the coming-soon list', async ({ page }) => {
    await page.goto(PAGE);
    const order = await page.evaluate(() => {
      const main = document.querySelector('main');
      const changes = main?.querySelector('.month-changes');
      const legend = main?.querySelector('.season-legend');
      const h2s = [...(main?.querySelectorAll('h2') ?? [])];
      const comingSoon = h2s.find((heading) => heading.textContent?.includes('Идват скоро'));
      const follows = (a?: Element | null, b?: Element | null) =>
        a != null &&
        b != null &&
        (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      return { afterLegend: follows(legend, changes), beforeComing: follows(changes, comingSoon) };
    });
    expect(order).toEqual({ afterLegend: true, beforeComing: true });
    await expect(
      page.getByRole('heading', { level: 2, name: 'Какво се сменя през ноември' }),
    ).toBeVisible();
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`AC9: no axe violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE);
      await expectNoAxeViolations(page);
    });
  }
});
