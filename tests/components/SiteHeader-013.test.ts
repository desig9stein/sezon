import { describe, expect, it } from 'vitest';
import SiteHeader from '@components/layout/SiteHeader.astro';
import { render } from './render';

describe('SiteHeader (spec 013)', () => {
  it('AC6: renders the wordmark without the emoji glyph', async () => {
    const html = await render(SiteHeader, { currentPath: '/' });
    expect(html).toMatch(/class="site-header__logo"[^>]*>\s*Сезон\s*<\/a>/);
    expect(html).not.toContain('🌱');
  });
});
