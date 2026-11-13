import { describe, expect, it } from 'vitest';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { regionProfileRecord } from '@tests/fixtures/records';

describe('region mapping (spec 038)', () => {
  it('AC6: maps a profile into region.profile', () => {
    const record = regionSchema.parse({ name: 'Пловдив', profile: regionProfileRecord() });
    const region = toRegion('plovdiv', record);
    expect(region.profile?.utilisedAreaHa).toBe(257175);
    expect(region.profile?.topFruits[0]?.name).toBe('черешите');
  });

  it('AC6: leaves region.profile undefined without a profile', () => {
    expect(toRegion('plovdiv', regionSchema.parse({ name: 'Пловдив' })).profile).toBeUndefined();
  });

  it('AC6: the schema rejects three top fruits and a profile without sources', () => {
    const fruit = { name: 'сливите', areaHa: 10 };
    expect(
      regionSchema.safeParse({
        name: 'Пловдив',
        profile: regionProfileRecord({ topFruits: [fruit, fruit, fruit] }),
      }).success,
    ).toBe(false);
    expect(
      regionSchema.safeParse({ name: 'Пловдив', profile: regionProfileRecord({ sources: [] }) })
        .success,
    ).toBe(false);
  });
});
