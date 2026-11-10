import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { Month, SeasonLevel } from '@contexts/seasonality';
import { produceRecord } from '@tests/fixtures/records';

const produce = toProduce('zele', produceRecord());

describe('Produce', () => {
  it('AC3: returns the season level for a month', () => {
    expect(produce.levelIn(Month.of(10))).toBe(SeasonLevel.PEAK);
    expect(produce.levelIn(Month.of(1))).toBe(SeasonLevel.STORAGE);
    expect(produce.levelIn(Month.of(6))).toBeUndefined();
  });

  it('AC3: reports freshness for a month', () => {
    expect(produce.isFreshIn(Month.of(11))).toBe(true);
    expect(produce.isFreshIn(Month.of(1))).toBe(false);
  });

  it('AC3: reports whether it is grown in a region', () => {
    expect(produce.isGrownIn('plovdiv')).toBe(true);
    expect(produce.isGrownIn('varna')).toBe(false);
  });
});
