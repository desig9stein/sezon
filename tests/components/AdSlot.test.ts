import { describe, expect, it } from 'vitest';
import AdSlot from '@components/ads/AdSlot.astro';
import { Sponsor } from '@contexts/advertising';
import zeleImage from '../../src/assets/produce/zele.jpg';
import { sponsorInput } from '@tests/fixtures/sponsors';
import { render } from './render';

const AD_RATIO = 4;
/** Intrinsic width that fits a 412 px viewport without CSS (QA 037). */
const MOBILE_SAFE_WIDTH = 480;
const sponsor = Sponsor.create(sponsorInput({ image: zeleImage }));

describe('AdSlot', () => {
  it('AC8: renders nothing without a sponsor', async () => {
    const html = await render(AdSlot, { sponsor: undefined, placement: 'produce' });
    expect(html.trim()).toBe('');
  });

  it('AC9: renders an aside labelled by its visible label with a sponsored link around a lazy image', async () => {
    const html = await render(AdSlot, { sponsor, placement: 'produce' });

    const aside = html.match(/<aside[^>]*class="ad-slot[^"]*"[^>]*>/)?.[0] ?? '';
    const labelId = aside.match(/aria-labelledby="([^"]+)"/)?.[1] ?? '';
    expect(labelId).not.toBe('');
    expect(aside).not.toContain('aria-label=');
    const labelPattern = new RegExp(`<p[^>]*id="${labelId}"[^>]*>\\s*Реклама\\s*</p>`);
    expect(html).toMatch(labelPattern);
    const label = html.search(labelPattern);
    const link = html.indexOf('<a ');
    expect(label).toBeGreaterThan(-1);
    expect(link).toBeGreaterThan(label);

    const anchor = html.match(/<a [^>]*>/)?.[0] ?? '';
    expect(anchor).toContain(`href="${sponsor.url}"`);
    expect(anchor).toContain('rel="sponsored noopener"');

    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(html.indexOf('<img')).toBeGreaterThan(link);
    expect(img).toContain(`alt="${sponsor.alt}"`);
    expect(img).toContain('loading="lazy"');
    expect(img).toContain('decoding="async"');
    const width = Number(img.match(/width="(\d+)"/)?.[1]);
    const height = Number(img.match(/height="(\d+)"/)?.[1]);
    expect(width).toBe(MOBILE_SAFE_WIDTH);
    expect(width / height).toBe(AD_RATIO);
    expect(img).toMatch(/srcset="[^"]*960w/);
  });
});
