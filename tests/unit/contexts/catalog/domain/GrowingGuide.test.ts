import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { growingRecord } from '@tests/fixtures/growing';
import { produceRecord } from '@tests/fixtures/records';

describe('GrowingGuide', () => {
  it('AC2: maps the growing block with sorted Month values', () => {
    const produce = toProduce('zele', produceRecord({ growing: growingRecord({ sow: [4, 3] }) }));
    const growing = produce.growing;
    expect(growing?.sow.map((month) => month.number)).toEqual([3, 4]);
    expect(growing?.transplant.map((month) => month.number)).toEqual([5]);
    expect(growing?.plant).toEqual([]);
    expect(growing?.tips).toHaveLength(3);
    expect(growing?.sources.map((source) => source.url)).toEqual(['https://agrozona.bg/zele']);
    expect(Object.isFrozen(growing)).toBe(true);
  });

  it('AC2: lists the activities due in a month', () => {
    const growing = toProduce(
      'zele',
      produceRecord({ growing: growingRecord({ sow: [3, 4], transplant: [4], plant: [] }) }),
    ).growing;
    expect(growing?.activitiesIn(Month.of(3))).toEqual(['sow']);
    expect(growing?.activitiesIn(Month.of(4))).toEqual(['sow', 'transplant']);
    expect(growing?.activitiesIn(Month.of(9))).toEqual([]);
  });

  it('AC2: has no growing guide without the block', () => {
    expect(toProduce('zele', produceRecord()).growing).toBeUndefined();
  });
});
