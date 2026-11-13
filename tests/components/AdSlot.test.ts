import { describe, expect, it } from 'vitest';
import AdSlot from '@components/ads/AdSlot.astro';
import { Sponsor } from '@contexts/advertising';
import zeleImage from '../../src/assets/produce/zele.jpg';
import { sponsorInput } from '@tests/fixtures/sponsors';
import { render } from './render';

const AD_RATIO = 4;
const sponsor = Sponsor.create(sponsorInput({ image: zeleImage }));

describe('AdSlot', () => {
  it('AC8: renders nothing without a sponsor', async () => {
    const html = await render(AdSlot, { sponsor: undefined, placement: 'produce' });
    expect(html.trim()).toBe('');
  });

  it('AC9: renders a labelled aside with a sponsored link around a lazy image', async () => {
    const html = await render(AdSlot, { sponsor, placement: 'produce' });

    expect(html).toMatch(/<aside[^>]*class="ad-slot[^"]*"[^>]*aria-label="Реклама"/);
    const label = html.indexOf('>Реклама<');
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
    expect(width).toBeGreaterThan(0);
    expect(width / height).toBe(AD_RATIO);
  });
});
