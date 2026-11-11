import { describe, expect, it } from 'vitest';
import { ProduceGroupIndexService } from '@contexts/catalog';
import { toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { ProduceGroupNotFoundError } from '@shared/domain/errors';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const groups = new IndexedRepository(async () => [
  toProduceGroup('krastotsvetni', {
    name: 'Кръстоцветни',
    latinName: 'Brassicaceae',
    description: 'Зеле и роднините му.',
  }),
  toProduceGroup('rozotsvetni', {
    name: 'Розоцветни',
    latinName: 'Rosaceae',
    description: 'Ябълки, круши и дюли.',
  }),
]);
const service = new ProduceGroupIndexService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({
      slug: 'yabalki',
      name: 'Ябълки',
      kind: 'fruit',
      group: 'rozotsvetni',
      season: [{ month: 11, level: 'available' }],
    }),
  ]),
  groups,
);
const slugs = (items: ReadonlyArray<{ slug: string }>) => items.map((item) => item.slug);

describe('ProduceGroupIndexService', () => {
  it('AC2: returns only the produce of the group, split by season', async () => {
    const index = await service.groupFor('rozotsvetni', Month.of(11));
    expect(index.group.name).toBe('Розоцветни');
    expect(slugs(index.all)).toEqual(['yabalki']);
    expect(slugs(index.available)).toEqual(['yabalki']);
    expect(index.peak).toEqual([]);
  });

  it('AC2: throws ProduceGroupNotFoundError for an unknown slug', async () => {
    await expect(service.groupFor('nyama', Month.of(11))).rejects.toThrow(
      ProduceGroupNotFoundError,
    );
  });

  it('AC2: lists every group', async () => {
    expect(slugs(await service.allGroups())).toEqual(['krastotsvetni', 'rozotsvetni']);
  });
});
