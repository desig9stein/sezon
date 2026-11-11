import { describe, expect, it } from 'vitest';
import { produceToc } from '@components/produce/produceToc';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { growingRecord } from '@tests/fixtures/growing';
import { produceRecord } from '@tests/fixtures/records';

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
