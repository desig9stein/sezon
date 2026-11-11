import { describe, expect, it } from 'vitest';
import SeasonBadge from '@components/season/SeasonBadge.astro';
import { SeasonLevel } from '@contexts/seasonality';
import { render } from './render';

describe('SeasonBadge', () => {
  it.each([
    [SeasonLevel.PEAK, 'Разгар на сезона'],
    [SeasonLevel.AVAILABLE, 'В сезон'],
    [SeasonLevel.STORAGE, 'От хранилище'],
  ])('AC5: renders a hidden icon and the label for %o', async (level, label) => {
    const html = await render(SeasonBadge, { level });
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"[^>]*>/);
    expect(html).toContain(label);
    expect(html).toContain(`data-level="${level.value}"`);
  });
});
