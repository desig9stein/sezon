import { describe, expect, it } from 'vitest';
import { Produce, type ProduceInput } from '@contexts/catalog';
import { SeasonCalendar } from '@contexts/seasonality';
import { InvalidProduceError } from '@shared/domain/errors';

const input: ProduceInput = {
  slug: 'piper',
  name: 'Пипер',
  kind: 'vegetable',
  groupSlug: 'kartofovi',
  summary: 'Тестов запис.',
  varieties: [],
  calendar: SeasonCalendar.from([{ month: 8, level: 'peak' }]),
  growingRegions: [],
  preparation: [{ method: 'Печене', tip: 'Изпечи чушките цели.' }],
  traditionalUses: [],
  faq: [],
  updatedAt: new Date('2026-11-17'),
};

describe('Produce aliases (spec 062)', () => {
  it('AC11: defaults to no aliases', () => {
    expect(Produce.create(input).aliases).toEqual([]);
  });

  it('AC11: keeps an alias that its own text uses', () => {
    expect(Produce.create({ ...input, aliases: ['чушки'] }).aliases).toEqual(['чушки']);
  });

  it('AC11: rejects an alias that its own text does not use', () => {
    expect(() => Produce.create({ ...input, aliases: ['камби'] })).toThrow(InvalidProduceError);
  });

  it('QA 062: rejects an alias that is only a fragment of a word its text uses', () => {
    expect(() => Produce.create({ ...input, aliases: ['чушк'] })).toThrow(InvalidProduceError);
    expect(() =>
      Produce.create({ ...input, name: 'Ябълки', slug: 'yabalki', aliases: ['ябъл'] }),
    ).toThrow(InvalidProduceError);
  });

  it('QA 062: keeps an alias that its text uses in another form', () => {
    expect(
      Produce.create({ ...input, name: 'Ябълки', slug: 'yabalki', aliases: ['ябълка'] }).aliases,
    ).toEqual(['ябълка']);
  });
});
