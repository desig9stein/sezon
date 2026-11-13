import { describe, expect, it } from 'vitest';
import { Produce, type ProduceInput } from '@contexts/catalog';
import { SeasonCalendar } from '@contexts/seasonality';
import { InvalidProduceError } from '@shared/domain/errors';
import { CAUTION_SOURCE } from '@tests/fixtures/records';

const input: ProduceInput = {
  slug: 'gluharche',
  name: 'Глухарче',
  kind: 'herb',
  groupSlug: 'slozhnotsvetni',
  summary: 'Тестов запис.',
  varieties: [],
  calendar: SeasonCalendar.from([{ month: 4, level: 'peak' }]),
  growingRegions: [],
  preparation: [],
  traditionalUses: [],
  faq: [],
  updatedAt: new Date('2026-11-13'),
};

describe('Produce wild invariant (spec 055)', () => {
  it('AC7: throws InvalidProduceError for a wild produce without a caution', () => {
    expect(() => Produce.create({ ...input, wild: true })).toThrow(InvalidProduceError);
    expect(() => Produce.create({ ...input, wild: true, cautions: [] })).toThrow(
      InvalidProduceError,
    );
  });

  it('AC7: creates a wild produce with a caution, and a produce without either', () => {
    const wild = Produce.create({
      ...input,
      wild: true,
      cautions: [
        { kind: 'look-alike', text: 'Тестов текст на предупреждение.', source: CAUTION_SOURCE },
      ],
    });
    expect(wild.wild).toBe(true);
    expect(wild.cautions).toHaveLength(1);
    const plain = Produce.create(input);
    expect(plain.wild).toBe(false);
    expect(plain.cautions).toEqual([]);
  });
});
