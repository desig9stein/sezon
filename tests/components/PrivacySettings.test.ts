import { describe, expect, it } from 'vitest';
import PrivacySettings from '@components/ads/PrivacySettings.astro';
import { ui } from '@i18n/bg';
import { render } from './render';

const adsense = { client: 'ca-pub-1234567890123456', slot: '1234567890' };

describe('PrivacySettings (spec 046)', () => {
  it('AC5: with AdSense on, renders a hidden settings button, the no-JavaScript note and the island', async () => {
    const html = await render(PrivacySettings, { adsense });
    const button = html.match(/<button[^>]*>[^<]*<\/button>/)?.[0] ?? '';
    expect(button).toContain('type="button"');
    expect(button).toContain('data-privacy-settings');
    expect(button).toContain(`data-ad-client="${adsense.client}"`);
    expect(button).toMatch(/\shidden[\s>]/);
    expect(button).toContain(ui.cookies.settingsButton);
    expect(html).toContain(ui.cookies.settingsNoScript);
    expect(html).toMatch(/<script[^>]*type="module"/);
    expect(html).not.toContain(ui.cookies.noConsentStored);
  });

  it('AC5: with AdSense off, says no consent is stored and renders no button or script', async () => {
    const html = await render(PrivacySettings, { adsense: undefined });
    expect(html).toContain(ui.cookies.noConsentStored);
    expect(html).not.toContain('<button');
    expect(html).not.toContain('<script');
  });
});
