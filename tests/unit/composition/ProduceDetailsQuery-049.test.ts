import { describe, expect, it } from 'vitest';
import { ProduceDetailsQuery } from '@composition/ProduceDetailsQuery';
import { findBrokenReferences } from '@composition/contentIntegrity';
import { toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { testImage } from '@tests/fixtures/photos';
import { MINIMAL_PRODUCE_INPUT } from '@tests/fixtures/records';

const ON = new Date('2026-11-13T12:00:00+02:00');
const record = produceSchemaWith({ image: testImage }).parse(MINIMAL_PRODUCE_INPUT);
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

describe('produce details without optional data (spec 049)', () => {
  it('AC5: returns no micronutrients and no sources for a minimal produce', async () => {
    const query = new ProduceDetailsQuery({
      produce: repositoryOf([toProduce('hryan', record)]),
      groups: repositoryOf([
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([]),
      regions: repositoryOf([]),
      farms: new IndexedFarmRepository(async () => []),
    });
    const details = await query.forSlug('hryan', ON);
    expect(details.micronutrients).toEqual([]);
    expect(details.growingRegions).toEqual([]);
    expect(details.sources).toEqual([]);
  });

  it('AC7: reports only the group of a produce without nutrition as a reference', () => {
    expect(
      findBrokenReferences({
        produce: new Map([['hryan', record]]),
        groups: new Map(),
        nutrients: new Map(),
        regions: new Map(),
        farms: new Map(),
      }),
    ).toEqual(['produce/hryan → groups/krastotsvetni']);
  });
});
