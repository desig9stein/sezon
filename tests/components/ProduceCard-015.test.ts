import { describe, expect, it } from 'vitest';
import ProduceCard from '@components/produce/ProduceCard.astro';
import zeleImage from '../../src/assets/produce/zele.jpg';
import { aProduce } from '@tests/fixtures/produce';
import { photoRecord } from '@tests/fixtures/photos';
import { render } from './render';

const season = [{ month: 11, level: 'peak' as const }];
const withPhoto = aProduce({
  slug: 'zele',
  name: 'Зеле',
  season,
  photo: photoRecord({ src: zeleImage }),
});
const withoutPhoto = aProduce({ slug: 'zele', name: 'Зеле', season });

describe('ProduceCard photos', () => {
  it('AC5: the plate shows a decorative, lazy photo before the name', async () => {
    const html = await render(ProduceCard, { produce: withPhoto, variant: 'plate' });
    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toMatch(/\salt(?:="")?[\s>]/);
    expect(img).toMatch(/loading="lazy"/);
    expect(html.indexOf('<picture')).toBeLessThan(html.indexOf('Зеле</a>'));
    expect(html).toMatch(/<source[^>]*type="image\/avif"/);
  });

  it('AC5: the plate photo is eager with priority', async () => {
    const html = await render(ProduceCard, {
      produce: withPhoto,
      variant: 'plate',
      priority: true,
    });
    expect(html.match(/<img[^>]*>/)?.[0]).toMatch(/loading="eager"/);
  });

  it('AC5: index rows and produce without a photo render no image', async () => {
    const index = await render(ProduceCard, { produce: withPhoto, variant: 'index' });
    const plain = await render(ProduceCard, { produce: withoutPhoto, variant: 'plate' });
    expect(index).not.toContain('<img');
    expect(plain).not.toContain('<img');
  });
});
