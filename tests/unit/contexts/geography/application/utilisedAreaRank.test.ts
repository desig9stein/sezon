import { describe, expect, it } from 'vitest';
import { utilisedAreaRank } from '@contexts/geography';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { regionProfileRecord } from '@tests/fixtures/records';

const withArea = (slug: string, utilisedAreaHa: number) =>
  toRegion(slug, {
    name: slug,
    profile: regionProfileRecord({ utilisedAreaHa, arableHa: 1, grasslandHa: 1 }),
  });

const regions = [
  withArea('plovdiv', 257175),
  withArea('dobrich', 357520),
  withArea('smolyan', 34777),
  withArea('burgas', 257175),
  toRegion('nowhere', { name: 'Без профил' }),
];

describe('utilisedAreaRank (spec 038)', () => {
  it('AC7: ranks the largest utilised area first among the regions with a profile', () => {
    expect(utilisedAreaRank(regions, 'dobrich')).toEqual({ rank: 1, total: 4 });
    expect(utilisedAreaRank(regions, 'smolyan')).toEqual({ rank: 4, total: 4 });
  });

  it('AC7: gives tied regions the same rank', () => {
    expect(utilisedAreaRank(regions, 'plovdiv')).toEqual({ rank: 2, total: 4 });
    expect(utilisedAreaRank(regions, 'burgas')).toEqual({ rank: 2, total: 4 });
  });

  it('AC7: returns undefined for a region without a profile or an unknown slug', () => {
    expect(utilisedAreaRank(regions, 'nowhere')).toBeUndefined();
    expect(utilisedAreaRank(regions, 'atlantida')).toBeUndefined();
  });
});
