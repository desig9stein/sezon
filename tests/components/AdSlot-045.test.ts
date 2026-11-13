import { describe, expect, it } from 'vitest';
import AdSlot from '@components/ads/AdSlot.astro';
import { Sponsor } from '@contexts/advertising';
import zeleImage from '../../src/assets/produce/zele.jpg';
import { sponsorInput } from '@tests/fixtures/sponsors';
import { render } from './render';

const adsense = { client: 'ca-pub-1234567890123456', slot: '1234567890' };
const sponsor = Sponsor.create(sponsorInput({ image: zeleImage }));

describe('AdSlot with AdSense (spec 045)', () => {
  it('AC4: renders the labelled reserved box with the ad unit and the island', async () => {
    const html = await render(AdSlot, { sponsor: undefined, placement: 'month', adsense });

    const aside = html.match(/<aside[^>]*>/)?.[0] ?? '';
    expect(aside).toContain('class="ad-slot ad-slot--adsense');
    expect(aside).toContain('aria-labelledby="ad-slot-month-label"');
    expect(html).toMatch(/<p[^>]*id="ad-slot-month-label"[^>]*>\s*Реклама\s*<\/p>/);

    const box = html.match(/<div[^>]*class="ad-slot__box[^"]*"[^>]*>/)?.[0] ?? '';
    expect(box).toContain('--ad-slot-ratio: 4 / 1');
    const ins = html.match(/<ins[^>]*>/)?.[0] ?? '';
    expect(ins).toContain('class="adsbygoogle');
    expect(ins).toContain('style="display:block"');
    expect(ins).toContain(`data-ad-client="${adsense.client}"`);
    expect(ins).toContain(`data-ad-slot="${adsense.slot}"`);
    expect(ins).not.toContain('data-ad-format');
    expect(html.indexOf('id="ad-slot-month-label"')).toBeLessThan(html.indexOf('<ins'));
    expect(html).toMatch(/<script[^>]*type="module"/);
    expect(html).not.toContain('googlesyndication.com/pagead/js');
  });

  it('AC5: renders nothing with AdSense off and no sponsor', async () => {
    const html = await render(AdSlot, { sponsor: undefined, placement: 'produce' });
    expect(html.trim()).toBe('');
    const explicit = await render(AdSlot, {
      sponsor: undefined,
      placement: 'produce',
      adsense: undefined,
    });
    expect(explicit.trim()).toBe('');
  });

  it('AC6: a sponsor wins over AdSense', async () => {
    const html = await render(AdSlot, { sponsor, placement: 'produce', adsense });
    expect(html).toContain('rel="sponsored noopener"');
    expect(html).not.toContain('adsbygoogle');
    expect(html).not.toContain('<script');
  });
});
