import { expect, test } from '@playwright/test';

/** Draws a strip cell's computed form: fill colour, stroke colour and whether it has hatch lines. */
const cellForms = () =>
  [...document.querySelectorAll('.year-strip [data-level]')].map((cell) => {
    const style = getComputedStyle(cell);
    return {
      level: cell.getAttribute('data-level'),
      fill: style.fill,
      stroke: style.stroke,
      hatch:
        cell.parentElement?.querySelector(`[data-hatch="${cell.getAttribute('data-month')}"]`) !==
        null,
    };
  });

const formOf = (cell: { fill: string; stroke: string; hatch: boolean }) =>
  `${cell.fill === 'none' ? 'open' : 'filled'}|${cell.stroke === 'none' ? 'nostroke' : 'stroke'}|${cell.hatch}`;

test.describe('season stamp, QA 024', () => {
  for (const media of ['screen', 'print'] as const) {
    test(`QA 024: strip levels differ by form, not colour alone (${media})`, async ({ page }) => {
      await page.emulateMedia({ media });
      await page.goto('/sezon/noemvri');
      const forms = await page.evaluate(cellForms);
      const byLevel = new Map<string, Set<string>>();
      for (const cell of forms) {
        const set = byLevel.get(cell.level ?? '') ?? new Set<string>();
        set.add(formOf(cell));
        byLevel.set(cell.level ?? '', set);
      }
      const levels = ['peak', 'available', 'storage', 'none'];
      const signatures = levels.map((level) => [...(byLevel.get(level) ?? [])].join());
      expect(signatures.every((signature) => signature !== '')).toBe(true);
      expect(new Set(signatures).size).toBe(levels.length);
    });
  }

  test('QA 024: without CSS the strip keeps its size and has a title', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      for (const sheet of [...document.styleSheets]) sheet.disabled = true;
      for (const element of document.querySelectorAll('[style]')) element.removeAttribute('style');
    });
    const strip = page.locator('.year-strip').first();
    const box = await strip.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(60);
    expect(box?.height ?? 0).toBeGreaterThan(6);
    await expect(strip.locator('title')).toHaveCount(1);
  });

  test('QA 024: the storage stamp is hatched in the accent colour', async ({ page }) => {
    await page.goto('/sezon/noemvri');
    const background = await page
      .locator(".season-stamp[data-level='storage']")
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundImage);
    const accent = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--color-accent)';
      document.body.append(probe);
      return getComputedStyle(probe).color;
    });
    expect(background).toContain(accent);
  });

  test('QA 024: Latin names and kinds are never cut off at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const cut = await page
      .locator('.season-row__meta')
      .evaluateAll((metas) => metas.filter((meta) => meta.scrollWidth > meta.clientWidth).length);
    expect(cut).toBe(0);
  });

  test('QA 024: the legend explains the strip and does not repeat the stamp word', async ({
    page,
  }) => {
    await page.goto('/');
    const legend = page.locator('.season-legend');
    await expect(legend.locator('.year-strip, .season-legend__cell')).not.toHaveCount(0);
    const lines = await legend
      .locator('li')
      .evaluateAll((items) =>
        items.map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
      );
    for (const line of lines) {
      const [first, ...rest] = line.split(' ');
      expect(rest.join(' ').startsWith(first ?? '')).toBe(false);
    }
    expect(lines.join(' ')).toMatch(/текущият месец/i);
  });

  test('QA 024: home headings are not repeated', async ({ page }) => {
    await page.goto('/');
    const h1 = (await page.locator('h1').textContent())?.replace(/\s+/g, ' ').trim() ?? '';
    const h2 = (await page.locator('.season-list h2').textContent())?.trim() ?? '';
    expect(h2.toLowerCase().startsWith(h1.toLowerCase())).toBe(false);
  });

  test('QA 024: the current month outline prints in ink', async ({ page }) => {
    await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
    await page.goto('/');
    const stroke = await page
      .locator('.year-strip__current')
      .first()
      .evaluate((element) => getComputedStyle(element).stroke);
    expect(stroke).toBe('rgb(0, 0, 0)');
  });
});
