import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { produceSchema, produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { MINIMAL_PRODUCE_INPUT, produceRecord } from '@tests/fixtures/records';

const schema = produceSchemaWith({ image: testImage });
const { nutrition } = produceRecord();

describe('season-only mandatory produce schema (spec 049)', () => {
  it('AC1: accepts a produce with only name, kind, group, summary, season and updatedAt', () => {
    const result = schema.safeParse(MINIMAL_PRODUCE_INPUT);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data).toMatchObject({
      varieties: [],
      regions: [],
      preparation: [],
      traditionalUses: [],
      faq: [],
    });
    expect(result.data?.latinName).toBeUndefined();
    expect(result.data?.nutrition).toBeUndefined();
    expect(result.data?.howToChoose).toBeUndefined();
    expect(result.data?.storage).toBeUndefined();
  });

  it.each(['name', 'kind', 'group', 'summary', 'season', 'updatedAt'] as const)(
    'AC2: rejects a produce without %s',
    (field) => {
      const input = Object.fromEntries(
        Object.entries(MINIMAL_PRODUCE_INPUT).filter(([key]) => key !== field),
      );
      expect(schema.safeParse(input).success).toBe(false);
    },
  );

  it('AC2: rejects an empty season', () => {
    expect(schema.safeParse({ ...MINIMAL_PRODUCE_INPUT, season: [] }).success).toBe(false);
  });

  it.each([
    ['without a source', { ...nutrition, source: undefined }],
    ['without energy', { ...nutrition, energyKcal: undefined }],
    ['without micronutrients', { ...nutrition, micronutrients: undefined }],
  ])('AC3: rejects a nutrition block %s', (_label, block) => {
    expect(produceSchema.safeParse({ ...MINIMAL_PRODUCE_INPUT, nutrition: block }).success).toBe(
      false,
    );
  });

  it('AC3: accepts a complete nutrition block and an empty preparation list', () => {
    const result = produceSchema.safeParse({
      ...MINIMAL_PRODUCE_INPUT,
      nutrition,
      preparation: [],
    });
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it('AC3: rejects an empty how-to-choose text', () => {
    expect(produceSchema.safeParse({ ...MINIMAL_PRODUCE_INPUT, howToChoose: '' }).success).toBe(
      false,
    );
  });

  it('AC4: maps a minimal record to a produce without the optional data', () => {
    const produce = toProduce('hryan', schema.parse(MINIMAL_PRODUCE_INPUT));
    expect(produce.latinName).toBeUndefined();
    expect(produce.nutrition).toBeUndefined();
    expect(produce.howToChoose).toBeUndefined();
    expect(produce.storage).toBeUndefined();
    expect(produce.photo).toBeUndefined();
    expect(produce.growing).toBeUndefined();
    expect(produce.organic).toBeUndefined();
    for (const list of [
      produce.varieties,
      produce.growingRegions,
      produce.preparation,
      produce.traditionalUses,
      produce.faq,
    ]) {
      expect(list).toEqual([]);
    }
  });
});
