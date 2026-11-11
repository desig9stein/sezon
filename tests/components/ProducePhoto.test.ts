import { describe, expect, it } from 'vitest';
import ProducePhoto from '@components/produce/ProducePhoto.astro';
import zeleImage from '../../src/assets/produce/zele.jpg';
import { photoRecord } from '@tests/fixtures/photos';
import { render } from './render';

const MAX_DISPLAY_WIDTH = 800;
const record = photoRecord();
const photo = { alt: record.alt, credit: record.credit, image: zeleImage };

describe('ProducePhoto', () => {
  it('AC4: renders a figure with AVIF and WebP sources, an eager img and a credit caption', async () => {
    const html = await render(ProducePhoto, { photo, latinName: 'Brassica oleracea' });

    expect(html).toMatch(/<figure[\s\S]*<picture[\s\S]*<\/picture>[\s\S]*<figcaption/);
    for (const type of ['image/avif', 'image/webp']) {
      expect(html).toMatch(new RegExp(`<source[^>]*type="${type}"[^>]*>`));
    }
    expect(html).toMatch(/<source[^>]*srcset="[^"]*\d+w[^"]*"/);
    expect(html).toMatch(/<source[^>]*sizes="[^"]+"/);

    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toContain(`alt="${photo.alt}"`);
    expect(img).toMatch(/loading="eager"/);
    expect(img).toMatch(/fetchpriority="high"/);
    const width = Number(img.match(/width="(\d+)"/)?.[1]);
    const height = Number(img.match(/height="(\d+)"/)?.[1]);
    expect(width).toBeGreaterThan(0);
    expect(width).toBeLessThanOrEqual(MAX_DISPLAY_WIDTH);
    expect(height / width).toBeCloseTo(3 / 4, 2);

    const caption = html.slice(html.indexOf('<figcaption'));
    expect(caption).toMatch(/<i lang="la"[^>]*>Brassica oleracea<\/i>/);
    expect(caption).toMatch(/Снимка:/);
    expect(caption).toMatch(/<a href="https:\/\/unsplash.com\/@natskov"[^>]*>Natasha Skov<\/a>/);
    expect(caption).toMatch(
      /<a href="https:\/\/unsplash.com\/photos\/ujh4hU9S-KA"[^>]*>Unsplash<\/a>/,
    );
  });
});
