import { describe, expect, it } from 'vitest';
import { ui } from '@i18n/bg';

describe('legal and advertising wording, QA 045/046 regressions', () => {
  it('QA5: the about page has off and on variants for advertising and privacy', () => {
    expect(ui.about.adsOff).toContain('няма реклами');
    expect(ui.about.adsOn).toContain('Google');
    expect(ui.about.adsOn).not.toContain('няма реклами');
    expect(ui.about.privacyOff).toContain('не използва бисквитки');
    expect(ui.about.privacyOn).not.toContain('не използва бисквитки');
    expect(ui.about.privacyOn).toContain('Google');
  });

  it('QA6: with AdSense on, the cookies page names the consent cookies on the site’s domain', () => {
    expect(ui.cookies.siteOff).toBe('Сезон не поставя свои бисквитки.');
    expect(ui.cookies.siteOn).toContain('FCCDCF');
    expect(ui.cookies.siteOn).toContain('FCNEC');
    expect(ui.cookies.siteOn).toMatch(/откаж/);
  });

  it('QA6, QA14: with AdSense on, the Google statements cover request data, limited ads and regions', () => {
    for (const text of [ui.cookies.googleOn, ui.privacy.adsOn]) {
      expect(text).toContain('IP адрес');
      expect(text).toContain('ограничени реклами');
      expect(text).toContain('може да се показват');
    }
    expect(ui.cookies.googleOn).toMatch(/ЕИП.*Обединеното кралство.*Швейцария/);
  });

  it('QA9: the privacy description holds whether or not AdSense is on', () => {
    expect(ui.privacy.description).not.toMatch(/без бисквитки/i);
  });

  it('QA10, QA14: advertising and consent wording', () => {
    expect(ui.advertising.labels).toContain('със „Спонсорирано“');
    expect(ui.advertising.intro).not.toContain('се издържа');
    expect(ui.advertising.offerItems.join(' ')).not.toContain('основното съдържание');
    expect(ui.advertising.offerItems[0]).toContain('„Яж“');
    expect(ui.cookies.noConsentStored).toContain('нито Сезон, нито Google поставят');
  });

  it('QA15: footer and about labels reuse the page names', () => {
    expect(ui.footer.advertising).toBe(ui.ads.label);
    expect(ui.footer.cookies).toBe(ui.cookies.heading);
    expect(ui.about.cookiesLink).toBe(ui.cookies.heading);
  });
});
