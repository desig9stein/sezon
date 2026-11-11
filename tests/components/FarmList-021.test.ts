import { describe, expect, it } from 'vitest';
import FarmList from '@components/produce/FarmList.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { ui } from '@i18n/bg';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

describe('FarmList without placeholders (spec 021)', () => {
  it('AC2: renders no placeholder label and has no placeholder string', async () => {
    const farm = toFarm('ferma', farmRecord());
    const html = await render(FarmList, {
      farms: [{ farm, region: toRegion('plovdiv', { name: 'Пловдив' }), certifiedOrganic: false }],
    });
    expect(html).not.toContain('Примерни данни');
    expect(Object.keys(ui.produce.farms)).not.toContain('placeholder');
  });
});
