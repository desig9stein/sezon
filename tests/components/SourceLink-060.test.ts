import { describe, expect, it } from 'vitest';
import SourceLink from '@components/ui/SourceLink.astro';
import { render } from './render';

const URL = 'https://fdc.nal.usda.gov/';

describe('SourceLink (spec 060)', () => {
  it('AC4: marks an English source title with lang="en"', async () => {
    const html = await render(SourceLink, {
      source: { name: 'USDA FoodData Central', url: URL, lang: 'en' },
    });
    expect(html).toMatch(
      /<a[^>]*href="https:\/\/fdc\.nal\.usda\.gov\/"[^>]*lang="en"|<a[^>]*lang="en"[^>]*href="https:\/\/fdc\.nal\.usda\.gov\/"/,
    );
    expect(html).toContain('>USDA FoodData Central</a>');
  });

  it('AC4: leaves lang out for a Bulgarian source', async () => {
    for (const source of [
      { name: 'МЗХ', url: URL },
      { name: 'МЗХ', url: URL, lang: 'bg' },
    ]) {
      const html = await render(SourceLink, { source });
      expect(html).toMatch(/<a[^>]*href=/);
      expect(html).not.toContain('lang=');
    }
  });
});
