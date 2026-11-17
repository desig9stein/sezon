import { describe, expect, it } from 'vitest';
import { WildProduceService } from '@contexts/catalog';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { produceRepositoryOf } from '@tests/fixtures/produce';
import { CAUTION_SOURCE, produceRecord } from '@tests/fixtures/records';

const caution = {
  kind: 'look-alike' as const,
  text: 'Тестов текст за отровен двойник на диворастящото растение.',
  source: CAUTION_SOURCE,
};
const wild = (slug: string, name: string, month: number) =>
  toProduce(
    slug,
    produceRecord({ name, wild: true, cautions: [caution], season: [{ month, level: 'peak' }] }),
  );
const repository = produceRepositoryOf([
  wild('trapka', 'Трънка', 10),
  toProduce('zele', produceRecord()),
  wild('baz', 'Черен бъз', 8),
  wild('glog', 'Глог', 9),
]);

describe('WildProduceService (spec 062)', () => {
  it('AC9: lists only the wild produce, in Bulgarian alphabetical order', async () => {
    const all = await new WildProduceService(repository).all();
    expect(all.map((produce) => produce.name)).toEqual(['Глог', 'Трънка', 'Черен бъз']);
  });

  it('AC9: groups the wild produce by its level in a month', async () => {
    const groups = await new WildProduceService(repository).groupsFor(Month.of(8));
    expect(groups.peak.map((produce) => produce.slug)).toEqual(['baz']);
    expect(groups.available).toEqual([]);
    expect(groups.outOfSeason.map((produce) => produce.slug)).toEqual(['glog', 'trapka']);
  });
});
