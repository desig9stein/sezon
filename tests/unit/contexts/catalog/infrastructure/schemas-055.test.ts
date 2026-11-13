import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { produceSchema, produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import {
  CAUTION_SOURCE,
  MINIMAL_PRODUCE_INPUT,
  produceRecord,
  WILD_PRODUCE_INPUT,
} from '@tests/fixtures/records';

const schema = produceSchemaWith({ image: testImage });
const KINDS = ['look-alike', 'toxic-part', 'allergy', 'protected', 'preparation'] as const;
const VALID_TEXT = 'Тестов текст на предупреждение с достатъчна дължина.';
const caution = (overrides: Record<string, unknown> = {}) => ({
  kind: 'look-alike',
  text: VALID_TEXT,
  source: CAUTION_SOURCE,
  ...overrides,
});
const withCautions = (cautions: unknown[]) => ({ ...WILD_PRODUCE_INPUT, cautions });

describe('wild produce and cautions schema (spec 055)', () => {
  it('AC1: defaults wild to false and cautions to an empty list', () => {
    const result = schema.safeParse(MINIMAL_PRODUCE_INPUT);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data).toMatchObject({ wild: false, cautions: [] });
  });

  it('AC2: accepts a wild produce with one caution of each kind', () => {
    const result = schema.safeParse(withCautions(KINDS.map((kind) => caution({ kind }))));
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data).toMatchObject({ wild: true });
    expect((result.data as { cautions: unknown[] } | undefined)?.cautions).toHaveLength(
      KINDS.length,
    );
  });

  it.each([
    ['an empty list', []],
    ['no cautions key', undefined],
  ])('AC3: rejects a wild produce with %s', (_label, cautions) => {
    const input =
      cautions === undefined
        ? Object.fromEntries(
            Object.entries(WILD_PRODUCE_INPUT).filter(([key]) => key !== 'cautions'),
          )
        : withCautions(cautions);
    for (const candidate of [schema, produceSchema]) {
      const result = candidate.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('cautions');
    }
  });

  it.each([
    ['an unknown kind', caution({ kind: 'poison' })],
    ['a text under 20 characters', caution({ text: 'Кратко.' })],
    ['a text over 200 characters', caution({ text: 'а'.repeat(201) })],
    ['a multi-line text', caution({ text: `${VALID_TEXT}\n${VALID_TEXT}` })],
    ['a source without a URL', caution({ source: { name: 'Източник' } })],
    ['an http source', caution({ source: { name: 'Източник', url: 'http://example.org/a' } })],
    ['an unknown key', caution({ severity: 'high' })],
    ['an unknown source key', caution({ source: { ...CAUTION_SOURCE, title: 'Заглавие' } })],
  ])('AC4: rejects a caution with %s', (_label, invalid) => {
    expect(schema.safeParse(withCautions([invalid])).success).toBe(false);
  });

  it('AC4: accepts texts of exactly 20 and 200 characters', () => {
    for (const text of ['а'.repeat(20), 'а'.repeat(200)]) {
      expect(schema.safeParse(withCautions([caution({ text })])).success, text.length).toBe(true);
    }
  });

  it('AC5: accepts a cultivated produce with a caution', () => {
    const result = schema.safeParse({
      ...MINIMAL_PRODUCE_INPUT,
      cautions: [caution({ kind: 'allergy' })],
    });
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.data).toMatchObject({ wild: false });
  });

  it('AC6: maps wild and the cautions with their sources, frozen', () => {
    const produce = toProduce('gluharche', schema.parse(WILD_PRODUCE_INPUT));
    expect(produce.wild).toBe(true);
    expect(produce.cautions).toEqual(WILD_PRODUCE_INPUT.cautions);
    expect(Object.isFrozen(produce.cautions)).toBe(true);
    expect(Object.isFrozen(produce.cautions[0])).toBe(true);
    expect(Object.isFrozen(produce.cautions[0]?.source)).toBe(true);
  });

  it('AC6: maps an existing produce as not wild, without cautions', () => {
    const produce = toProduce('zele', produceRecord());
    expect(produce.wild).toBe(false);
    expect(produce.cautions).toEqual([]);
  });
});
