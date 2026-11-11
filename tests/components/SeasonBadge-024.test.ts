import { describe, expect, it } from 'vitest';
import SeasonBadge from '@components/season/SeasonBadge.astro';
import { Month, SeasonLevel } from '@contexts/seasonality';
import { render } from './render';

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

describe('season stamp (spec 024)', () => {
  it.each([
    [SeasonLevel.PEAK, 'Разгар'],
    [SeasonLevel.AVAILABLE, 'В сезон'],
    [SeasonLevel.STORAGE, 'От хранилище'],
  ])('AC2: renders %o as a stamp with its short word', async (level, word) => {
    const html = await render(SeasonBadge, { level });
    expect(html).toContain(`data-level="${level.value}"`);
    expect(html).toMatch(/class="[^"]*season-stamp/);
    expect(text(html)).toBe(word);
    expect(html).not.toContain('<svg');
  });

  it('AC2: prefixes a coming-soon stamp with its month', async () => {
    const html = await render(SeasonBadge, {
      level: SeasonLevel.PEAK,
      fromMonth: Month.of(12),
    });
    expect(text(html)).toBe('От декември: Разгар');
  });
});
