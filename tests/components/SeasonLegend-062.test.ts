import { describe, expect, it } from 'vitest';
import SeasonKey from '@components/season/SeasonKey.astro';
import SeasonLegend from '@components/season/SeasonLegend.astro';
import { render } from './render';

/** The part of the strip text that says how the strip reads without the picture. */
const READ_ALOUD = 'прочетена, лентата изрежда месеците на всяко ниво';

describe('season legend text (spec 062)', () => {
  it('AC2: the legend says how the year strip reads as text', async () => {
    expect(await render(SeasonLegend)).toContain(READ_ALOUD);
  });

  it('AC2: the home key says how the year strip reads as text', async () => {
    expect(await render(SeasonKey)).toContain(READ_ALOUD);
  });
});
