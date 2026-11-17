import { describe, expect, it } from 'vitest';
import SourceLink from '@components/ui/SourceLink.astro';
import { render } from './render';

describe('SourceLink (spec 059, QA)', () => {
  it('QA 059: keeps the source name out of the search index', async () => {
    const html = await render(SourceLink, {
      source: { name: 'Български фермер', url: 'https://www.bgfermer.bg/' },
    });
    expect(html).toMatch(/<a[^>]*data-pagefind-ignore/);
  });
});
