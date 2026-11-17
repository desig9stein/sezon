import { describe, expect, it } from 'vitest';
import { type CautionKind, Produce, type ProduceInput } from '@contexts/catalog';
import { SeasonCalendar } from '@contexts/seasonality';
import { CAUTION_SOURCE } from '@tests/fixtures/records';

const input: ProduceInput = {
  slug: 'kesteni',
  name: 'Кестени',
  kind: 'nut',
  groupSlug: 'bukovi',
  summary: 'Тестов запис.',
  varieties: [],
  calendar: SeasonCalendar.from([{ month: 10, level: 'peak' }]),
  growingRegions: [],
  preparation: [],
  traditionalUses: [],
  faq: [],
  updatedAt: new Date('2026-11-17'),
};

const caution = (kind: CautionKind) => ({
  kind,
  text: 'Тестов текст на предупреждение.',
  source: CAUTION_SOURCE,
});

describe('Produce.warnsOfPoisoning (spec 058)', () => {
  it('AC5: is true for a wild produce', () => {
    const produce = Produce.create({ ...input, wild: true, cautions: [caution('protected')] });
    expect(produce.warnsOfPoisoning()).toBe(true);
  });

  it.each(['look-alike', 'toxic-part'] as const)(
    'AC5: is true for a cultivated produce with a %s caution',
    (kind) => {
      const produce = Produce.create({ ...input, cautions: [caution(kind)] });
      expect(produce.warnsOfPoisoning()).toBe(true);
    },
  );

  it.each(['allergy', 'protected', 'preparation'] as const)(
    'AC5: is false for a cultivated produce whose only caution is %s',
    (kind) => {
      const produce = Produce.create({ ...input, cautions: [caution(kind)] });
      expect(produce.warnsOfPoisoning()).toBe(false);
    },
  );

  it('AC5: is false for a produce without cautions', () => {
    expect(Produce.create(input).warnsOfPoisoning()).toBe(false);
  });
});
