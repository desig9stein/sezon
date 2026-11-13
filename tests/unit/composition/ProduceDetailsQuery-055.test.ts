import { describe, expect, it } from 'vitest';
import { ProduceDetailsQuery } from '@composition/ProduceDetailsQuery';
import { toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { testImage } from '@tests/fixtures/photos';
import { CAUTION_SOURCE, SECOND_CAUTION_SOURCE, WILD_PRODUCE_INPUT } from '@tests/fixtures/records';

const ON = new Date('2026-11-13T12:00:00+02:00');
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

describe('produce details with cautions (spec 055)', () => {
  it('AC8: lists every caution source once among the sources', async () => {
    const input = {
      ...WILD_PRODUCE_INPUT,
      cautions: [
        ...WILD_PRODUCE_INPUT.cautions,
        {
          kind: 'preparation',
          text: 'Трети тестов текст със същия източник като първия.',
          source: CAUTION_SOURCE,
        },
      ],
    };
    const record = produceSchemaWith({ image: testImage }).parse(input);
    const query = new ProduceDetailsQuery({
      produce: repositoryOf([toProduce('gluharche', record)]),
      groups: repositoryOf([
        toProduceGroup('slozhnotsvetni', {
          name: 'Сложноцветни',
          latinName: 'Asteraceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([]),
      regions: repositoryOf([]),
      farms: new IndexedFarmRepository(async () => []),
    });
    const details = await query.forSlug('gluharche', ON);
    expect(details.sources).toEqual([CAUTION_SOURCE, SECOND_CAUTION_SOURCE]);
  });
});
