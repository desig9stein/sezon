import { describe, expect, it } from 'vitest';
import { produceToc } from '@components/produce/produceToc';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { growingRecord } from '@tests/fixtures/growing';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { MINIMAL_PRODUCE_INPUT, produceRecord } from '@tests/fixtures/records';

describe('produceToc (QA 025)', () => {
  it('lists every group when the produce has a guide and questions', () => {
    const produce = toProduce('zele', produceRecord({ growing: growingRecord() }));
    expect(produceToc(produce).map((entry) => entry.id)).toEqual(
      produce.faq.length > 0
        ? ['stall', 'eat', 'grow', 'farms', 'faq', 'sources']
        : ['stall', 'eat', 'grow', 'farms', 'sources'],
    );
  });

  it('omits the grow and question entries when the content is absent', () => {
    const record = produceRecord({ faq: [] });
    const produce = toProduce('zele', { ...record, growing: undefined });
    expect(produceToc(produce).map((entry) => entry.id)).toEqual([
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
    expect(produceToc(produce).map((entry) => entry.id)).toEqual(['stall', 'farms', 'sources']);
  });

  it('AC8: keeps the eat entry for a minimal produce with a recipe (spec 048)', () => {
    const produce = toProduce(
      'hryan',
      produceSchemaWith({ image: testImage }).parse(MINIMAL_PRODUCE_INPUT),
    );
    expect(produceToc(produce, 1).map((entry) => entry.id)).toEqual([
      'stall',
      'eat',
      'farms',
      'sources',
    ]);
  });

  it('AC8: keeps the eat entry when only one of its sections has data', () => {
    const record = produceRecord({ preparation: [], traditionalUses: [] });
    expect(produceToc(toProduce('zele', record)).map((entry) => entry.id)).toContain('eat');
  });
});
