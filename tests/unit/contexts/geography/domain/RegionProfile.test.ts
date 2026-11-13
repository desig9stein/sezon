import { describe, expect, it } from 'vitest';
import { RegionProfile } from '@contexts/geography';
import { InvalidRegionProfileError } from '@shared/domain/errors';
import { regionProfileRecord } from '@tests/fixtures/records';

describe('RegionProfile (spec 038)', () => {
  it('AC1: keeps the figures and computes the shares of the utilised area', () => {
    const profile = RegionProfile.create(regionProfileRecord());
    expect(profile.utilisedAreaHa).toBe(257175);
    expect(profile.arableHa).toBe(195490);
    expect(profile.grasslandHa).toBe(47201);
    expect(profile.topFruits.map(({ name, areaHa }) => [name, areaHa])).toEqual([
      ['черешите', 1676],
      ['сливите', 1551],
    ]);
    expect(profile.sources).toHaveLength(2);
    expect(profile.arableShare).toBeCloseTo(195490 / 257175, 10);
    expect(profile.grasslandShare).toBeCloseTo(47201 / 257175, 10);
    expect(Object.isFrozen(profile)).toBe(true);
    expect(Object.isFrozen(profile.topFruits)).toBe(true);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'AC2: rejects a utilised, arable or grassland area of %s',
    (value) => {
      for (const key of ['utilisedAreaHa', 'arableHa', 'grasslandHa'] as const) {
        expect(() => RegionProfile.create(regionProfileRecord({ [key]: value })), key).toThrow(
          InvalidRegionProfileError,
        );
      }
    },
  );

  it('AC2: rejects a top fruit with an area that is not positive', () => {
    expect(() =>
      RegionProfile.create(regionProfileRecord({ topFruits: [{ name: 'сливите', areaHa: 0 }] })),
    ).toThrow(InvalidRegionProfileError);
  });

  it('AC3: rejects arable land plus grassland larger than the utilised area', () => {
    expect(() =>
      RegionProfile.create(
        regionProfileRecord({ utilisedAreaHa: 1000, arableHa: 600, grasslandHa: 401 }),
      ),
    ).toThrow(InvalidRegionProfileError);
    expect(() =>
      RegionProfile.create(
        regionProfileRecord({ utilisedAreaHa: 1000, arableHa: 600, grasslandHa: 400 }),
      ),
    ).not.toThrow();
  });

  it('AC4: requires one or two top fruits in descending order of area', () => {
    const fruit = (name: string, areaHa: number) => ({ name, areaHa });
    const withFruits = (topFruits: ReadonlyArray<{ name: string; areaHa: number }>) => () =>
      RegionProfile.create(regionProfileRecord({ topFruits: [...topFruits] }));
    expect(withFruits([])).toThrow(InvalidRegionProfileError);
    expect(withFruits([fruit('черешите', 30), fruit('сливите', 20), fruit('орехите', 10)])).toThrow(
      InvalidRegionProfileError,
    );
    expect(withFruits([fruit('сливите', 10), fruit('черешите', 11)])).toThrow(
      InvalidRegionProfileError,
    );
    expect(withFruits([fruit(' ', 10)])).toThrow(InvalidRegionProfileError);
    expect(withFruits([fruit('сливите', 10)])).not.toThrow();
    expect(withFruits([fruit('сливите', 10), fruit('орехите', 10)])).not.toThrow();
  });

  it('AC5: requires at least one source, all of them HTTPS', () => {
    expect(() => RegionProfile.create(regionProfileRecord({ sources: [] }))).toThrow(
      InvalidRegionProfileError,
    );
    expect(() =>
      RegionProfile.create(
        regionProfileRecord({ sources: [{ name: 'МЗХ', url: 'http://www.mzh.government.bg/' }] }),
      ),
    ).toThrow(InvalidRegionProfileError);
    expect(() =>
      RegionProfile.create(
        regionProfileRecord({ sources: [{ name: 'МЗХ', url: 'https://www.mzh.government.bg/' }] }),
      ),
    ).not.toThrow();
  });
});
