import { describe, expect, it } from 'vitest';
import FarmContacts from '@components/farms/FarmContacts.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

const websiteLink = (html: string) =>
  html.match(/<a[^>]*href="https:\/\/example\.com"[^>]*>/)?.[0] ?? '';

describe('FarmContacts, QA 046 regressions', () => {
  it('QA4: a sponsored farm’s website link is marked rel="sponsored noopener"', async () => {
    const html = await render(FarmContacts, {
      farm: toFarm('venets', farmRecord({ sponsored: true })),
    });
    expect(websiteLink(html)).toContain('rel="sponsored noopener"');
  });

  it('QA4: an unsponsored farm’s website link stays rel="noopener"', async () => {
    const html = await render(FarmContacts, { farm: toFarm('venets', farmRecord()) });
    expect(websiteLink(html)).toContain('rel="noopener"');
    expect(websiteLink(html)).not.toContain('sponsored');
  });
});
