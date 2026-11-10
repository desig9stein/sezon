import { expect, test } from '@playwright/test';
import { hiddenByCss, removeAllCss, reorderedByCss } from './noCss';

const page = (style: string, body: string): string =>
  `<!doctype html><html lang="bg"><head><title>t</title><style>${style}</style></head><body>${body}</body></html>`;

test.describe('no-CSS helpers', () => {
  const hidingPatterns = [
    ['opacity: 0', '.x { opacity: 0 }'],
    ['visibility: collapse', '.x { visibility: collapse }'],
    ['content-visibility: hidden', '.x { content-visibility: hidden }'],
    ['clip-path', '.x { clip-path: inset(50%) }'],
    ['off screen with left', '.x { position: absolute; left: -9999px }'],
    ['off screen with transform', '.x { transform: translateX(-200vw) }'],
    ['zero height with overflow hidden', '.x { height: 0; overflow: hidden }'],
  ] as const;

  for (const [name, style] of hidingPatterns) {
    test(`hiddenByCss detects ${name}`, async ({ page: browser }) => {
      await browser.setContent(page(style, '<p class="x">Текст</p>'));
      expect(await hiddenByCss(browser)).toContain('p.x');
    });
  }

  test('hiddenByCss detects a [hidden] element revealed by CSS', async ({ page: browser }) => {
    await browser.setContent(page('.x[hidden] { display: block }', '<p class="x" hidden>Т</p>'));
    expect(await hiddenByCss(browser)).toContain('p.x (revealed)');
  });

  test('hiddenByCss allows the skip link and visually hidden text', async ({ page: browser }) => {
    await browser.setContent(
      page(
        '.skip-link { position: absolute; transform: translateY(-200%) } .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%) }',
        '<a class="skip-link" href="#m">Към</a><span class="visually-hidden">Сезон:</span><p>Видим</p>',
      ),
    );
    expect(await hiddenByCss(browser)).toEqual([]);
  });

  test('hiddenByCss allows content reachable by scrolling a container', async ({
    page: browser,
  }) => {
    await browser.setViewportSize({ width: 320, height: 400 });
    await browser.setContent(
      page(
        '.scroll { overflow-x: auto } table { min-width: 60rem }',
        '<section class="scroll" tabindex="0"><table><tr><td>А</td><td class="far">Б</td></tr></table></section>',
      ),
    );
    expect(await hiddenByCss(browser)).toEqual([]);
  });

  const reorderPatterns = [
    ['float: right on siblings', '.r > * { float: right }'],
    ['direction: rtl', '.r { display: flex; direction: rtl }'],
  ] as const;

  for (const [name, style] of reorderPatterns) {
    test(`reorderedByCss detects ${name}`, async ({ page: browser }) => {
      await browser.setContent(page(style, '<div class="r"><p>А</p><p>Б</p></div>'));
      expect((await reorderedByCss(browser)).length).toBeGreaterThan(0);
    });
  }

  test('removeAllCss also removes adopted style sheets', async ({ page: browser }) => {
    await browser.setContent(page('', '<footer>Ф</footer>'));
    await browser.evaluate(() => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('footer { display: none }');
      document.adoptedStyleSheets = [sheet];
    });
    await removeAllCss(browser);
    expect(await browser.locator('footer').evaluate((f) => getComputedStyle(f).display)).toBe(
      'block',
    );
  });
});
