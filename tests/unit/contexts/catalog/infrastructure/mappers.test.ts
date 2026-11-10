import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { Month, SeasonCalendar, SeasonLevel } from '@contexts/seasonality';
import { produceRecord } from '@tests/fixtures/records';

describe('toProduce', () => {
  it('AC1: maps a record to a frozen Produce with a SeasonCalendar', () => {
    const produce = toProduce('zele', produceRecord());

    expect(produce.slug).toBe('zele');
    expect(produce.name).toBe('Зеле');
    expect(produce.kind).toBe('vegetable');
    expect(produce.groupSlug).toBe('krastotsvetni');
    expect(produce.calendar).toBeInstanceOf(SeasonCalendar);
    expect(produce.calendar.levelIn(Month.of(9))).toBe(SeasonLevel.PEAK);
    expect(produce.growingRegions).toEqual([
      { regionSlug: 'plovdiv', note: 'Тракийската низина има плодородни почви.' },
    ]);
    expect(produce.nutrition.energyKcal).toBe(25);
    expect(produce.nutrition.micronutrients).toEqual([
      { nutrientSlug: 'vitamin-c', amount: 36.6 },
      { nutrientSlug: 'vitamin-k', amount: 76 },
    ]);
    expect(produce.updatedAt).toEqual(new Date('2026-11-10'));
    expect(Object.isFrozen(produce)).toBe(true);
    expect(Object.isFrozen(produce.varieties)).toBe(true);
  });

  it('AC1: rejects an id that is not a slug', () => {
    expect(() => toProduce('Зеле', produceRecord())).toThrow();
  });
});
