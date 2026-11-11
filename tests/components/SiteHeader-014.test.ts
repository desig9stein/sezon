import { describe, expect, it } from 'vitest';
import SiteFooter from '@components/layout/SiteFooter.astro';
import SiteHeader from '@components/layout/SiteHeader.astro';
import { render } from './render';

describe('calendar links (spec 014)', () => {
  it('AC5: the header and the footer link to the calendar', async () => {
    expect(await render(SiteHeader, { currentPath: '/' })).toContain('href="/kalendar"');
    expect(await render(SiteFooter)).toContain('href="/kalendar"');
  });
});
