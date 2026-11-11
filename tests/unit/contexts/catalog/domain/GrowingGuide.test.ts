import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { GrowingGuide } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { InvalidProduceError } from '@shared/domain/errors';
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

  it('QA 018: rejects a guide without months and note, or without sources', () => {
    const input = { sow: [], transplant: [], plant: [], tips: ['а', 'б', 'в'], sources: [] };
    expect(() =>
      GrowingGuide.create({ ...input, sources: [{ name: 'x', url: 'https://x.bg' }] }),
    ).toThrow(InvalidProduceError);
    expect(() => GrowingGuide.create({ ...input, sow: [3] })).toThrow(InvalidProduceError);
  });

  it('QA 018: keeps each month once', () => {
    const guide = GrowingGuide.create({
      sow: [3, 3, 4],
      transplant: [],
      plant: [],
      tips: ['а', 'б', 'в'],
      sources: [{ name: 'x', url: 'https://x.bg' }],
    });
    expect(guide.sow.map((month) => month.number)).toEqual([3, 4]);
  });
});
