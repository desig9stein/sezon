import { describe, expect, it } from 'vitest';
import FarmContacts from '@components/farms/FarmContacts.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

const PROFILE = 'https://localstore.bg/ferma/zelena-dolina';
const PROFILE_NOTE = 'За връзка с фермата отвори профила ѝ в LocalStore.bg.';

describe('FarmContacts (spec 062)', () => {
  it('AC17: shows the e-mail address as the link text, named with the farm', async () => {
    const farm = toFarm(
      'venets',
      farmRecord({ contact: { website: 'https://example.com', email: 'farm@example.com' } }),
    );
    const html = await render(FarmContacts, { farm });
    const link = /<a[^>]*href="mailto:farm@example\.com"[^>]*>([^<]*)<\/a>/.exec(html);
    expect(link?.[1]?.trim()).toBe('farm@example.com');
    expect(link?.[0]).toContain('aria-label="Имейл до Зелена долина: farm@example.com"');
    expect(html).toContain('Имейл:');
  });

  it('AC16: tells that the contacts are on the profile when it is the only contact', async () => {
    const farm = toFarm('venets', farmRecord({ contact: { website: PROFILE } }));
    expect(await render(FarmContacts, { farm })).toContain(PROFILE_NOTE);
  });

  it('AC16: has no profile note when the farm also has a phone', async () => {
    const farm = toFarm(
      'venets',
      farmRecord({ contact: { website: PROFILE, phone: '+359899909310' } }),
    );
    expect(await render(FarmContacts, { farm })).not.toContain(PROFILE_NOTE);
  });
});
