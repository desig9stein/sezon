import { describe, expect, it } from 'vitest';
import { produceToc } from '@components/produce/produceToc';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { growingRecord } from '@tests/fixtures/growing';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import {
  CAUTION_SOURCE,
  MINIMAL_PRODUCE_INPUT,
  produceRecord,
  WILD_PRODUCE_INPUT,
} from '@tests/fixtures/records';

describe('produceToc (QA 025)', () => {
  it('lists every group when the produce has a guide and questions', () => {
    const produce = toProduce('zele', produceRecord({ growing: growingRecord() }));
    expect(produceToc(produce, { recipes: 0, farms: 1 }).map((entry) => entry.id)).toEqual(
      produce.faq.length > 0
        ? ['stall', 'eat', 'grow', 'farms', 'faq', 'sources']
        : ['stall', 'eat', 'grow', 'farms', 'sources'],
    );
  });

  it('omits the grow and question entries when the content is absent', () => {
    const record = produceRecord({ faq: [] });
    const produce = toProduce('zele', { ...record, growing: undefined });
    expect(produceToc(produce, { recipes: 0, farms: 1 }).map((entry) => entry.id)).toEqual([
      'stall',
      'eat',
      'farms',
      'sources',
    ]);
  });
});

describe('produceToc (spec 049)', () => {
  it('AC8: lists only the stall, farms and sources for a minimal produce', () => {
    const produce = toProduce(
      'hryan',
      produceSchemaWith({ image: testImage }).parse(MINIMAL_PRODUCE_INPUT),
    );
    expect(produceToc(produce, { recipes: 0, farms: 1 }).map((entry) => entry.id)).toEqual([
      'stall',
      'farms',
      'sources',
    ]);
  });

  it('AC8: keeps the eat entry for a minimal produce with a recipe (spec 048)', () => {
    const produce = toProduce(
      'hryan',
      produceSchemaWith({ image: testImage }).parse(MINIMAL_PRODUCE_INPUT),
    );
    expect(produceToc(produce, { recipes: 1, farms: 1 }).map((entry) => entry.id)).toEqual([
      'stall',
      'eat',
      'farms',
      'sources',
    ]);
  });

  it('AC8: keeps the eat entry when only one of its sections has data', () => {
    const record = produceRecord({ preparation: [], traditionalUses: [] });
    expect(
      produceToc(toProduce('zele', record), { recipes: 0, farms: 1 }).map((entry) => entry.id),
    ).toContain('eat');
  });
});

describe('produceToc (spec 055)', () => {
  const schema = produceSchemaWith({ image: testImage });

  it('AC9: lists the cautions right after the stall for a produce with cautions', () => {
    const produce = toProduce('gluharche', schema.parse(WILD_PRODUCE_INPUT));
    expect(produceToc(produce, { recipes: 0, farms: 1 }).map((entry) => entry.id)).toEqual([
      'stall',
      'cautions',
      'farms',
      'sources',
    ]);
    expect(produceToc(produce, { recipes: 0, farms: 1 })[1]?.label).toBe('Внимание');
  });

  it('AC9: lists the cautions of a cultivated produce too', () => {
    const produce = toProduce(
      'hryan',
      schema.parse({
        ...MINIMAL_PRODUCE_INPUT,
        cautions: [
          {
            kind: 'allergy',
            text: 'Тестов текст за алергия към растението.',
            source: CAUTION_SOURCE,
          },
        ],
      }),
    );
    expect(produceToc(produce, { recipes: 0, farms: 1 }).map((entry) => entry.id)).toContain(
      'cautions',
    );
  });

  it('AC9: leaves the cautions out when there are none', () => {
    const produce = toProduce('zele', produceRecord());
    expect(produceToc(produce, { recipes: 0, farms: 1 }).map((entry) => entry.id)).not.toContain(
      'cautions',
    );
  });
});

describe('produceToc (spec 060)', () => {
  it('AC11: leaves the farms entry out when no farm sells the produce', () => {
    const produce = toProduce('zele', produceRecord());
    const ids = produceToc(produce, { recipes: 0, farms: 0 }).map((entry) => entry.id);
    expect(ids).not.toContain('farms');
    expect(ids).toContain('sources');
  });

  it('AC11: keeps the farms entry when a farm sells the produce', () => {
    const produce = toProduce('zele', produceRecord());
    expect(produceToc(produce, { recipes: 0, farms: 2 }).map((entry) => entry.id)).toContain(
      'farms',
    );
  });
});
