import { describe, expect, it } from 'vitest';
import { produceSchema, produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { CAUTION_SOURCE, MINIMAL_PRODUCE_INPUT } from '@tests/fixtures/records';

const schema = produceSchemaWith({ image: testImage });
const caution = (kind: string) => ({
  kind,
  text: 'Тестов текст на предупреждение с достатъчна дължина.',
  source: CAUTION_SOURCE,
});
const NUTRITION = {
  energyKcal: 73,
  proteinG: 0.66,
  fatG: 0.5,
  carbohydrateG: 18.4,
  fiberG: 7,
  micronutrients: [],
  source: { name: 'USDA FoodData Central, SR Legacy: Test, raw', url: 'https://fdc.nal.usda.gov/' },
};
const paths = (result: { error?: { issues: ReadonlyArray<{ path: PropertyKey[] }> } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('produce not eaten raw (spec 058)', () => {
  it('AC1: defaults notEatenRaw to false', () => {
    const result = schema.safeParse(MINIMAL_PRODUCE_INPUT);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data).toMatchObject({ notEatenRaw: false });
  });

  it.each(['preparation', 'toxic-part'])(
    'AC1: accepts notEatenRaw with a %s caution and no nutrition',
    (kind) => {
      const result = schema.safeParse({
        ...MINIMAL_PRODUCE_INPUT,
        notEatenRaw: true,
        cautions: [caution(kind)],
      });
      expect(result.error?.issues ?? []).toEqual([]);
    },
  );

  it('AC1: rejects notEatenRaw together with nutrition', () => {
    for (const candidate of [schema, produceSchema]) {
      const result = candidate.safeParse({
        ...MINIMAL_PRODUCE_INPUT,
        notEatenRaw: true,
        cautions: [caution('preparation')],
        nutrition: NUTRITION,
      });
      expect(result.success).toBe(false);
      expect(paths(result)).toContain('nutrition');
    }
  });

  it.each([
    ['no caution', []],
    ['only an allergy caution', [caution('allergy')]],
    ['only a protected caution', [caution('protected')]],
  ])('AC1: rejects notEatenRaw with %s', (_label, cautions) => {
    const result = schema.safeParse({ ...MINIMAL_PRODUCE_INPUT, notEatenRaw: true, cautions });
    expect(result.success).toBe(false);
    expect(paths(result)).toContain('cautions');
  });
});
