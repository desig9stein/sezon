import { describe, expect, it } from 'vitest';
import FarmContacts from '@components/farms/FarmContacts.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

describe('FarmContacts phone (spec 060)', () => {
  it('AC10: shows the grouped number and keeps the E.164 tel: href', async () => {
    const farm = toFarm(
      'venets',
      farmRecord({ contact: { website: 'https://example.com', phone: '+359899909310' } }),
    );
    const html = await render(FarmContacts, { farm });
    const link = /<a[^>]*href="tel:[^"]*"[^>]*>([^<]*)<\/a>/.exec(html);
    expect(link?.[0]).toContain('href="tel:+359899909310"');
    expect(link?.[0]).toMatch(/aria-label="[^"]*: \+359 899 909 310"/);
    expect(link?.[1]?.trim()).toBe('+359 899 909 310');
  });
});
