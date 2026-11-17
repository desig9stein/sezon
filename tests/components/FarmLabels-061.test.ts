import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import FarmLabels from '@components/farms/FarmLabels.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { certificateRecord } from '@tests/fixtures/organic';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

const CERTIFICATE_URL =
  'https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/BG-BIO-18.100-0004936.2026.001.pdf';

const farm = toFarm(
  'vkusnagradina',
  farmRecord({
    organic: certificateRecord({
      certifier: 'COSMOCERT (BG-BIO-18)',
      certificateId: 'BG-BIO-18.100-0004936.2026.001',
      url: CERTIFICATE_URL,
    }),
  }),
);

async function documentOf(certifiedOrganic: boolean) {
  const html = await render(FarmLabels, { farm, certifiedOrganic });
  const window = new Window();
  window.document.write(`<main>${html}</main>`);
  return window.document;
}

describe('organic certificate link (spec 061)', () => {
  it('AC15: the organic label links to the certificate and shows its number', async () => {
    const link = (await documentOf(true)).querySelector(`a[href="${CERTIFICATE_URL}"]`);
    expect(link?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Био · COSMOCERT (BG-BIO-18), сертификат № BG-BIO-18.100-0004936.2026.001',
    );
  });

  it('AC15: shows no certificate when it is not valid', async () => {
    expect((await documentOf(false)).querySelector('a')).toBeNull();
  });
});
