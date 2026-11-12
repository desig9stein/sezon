import { describe, expect, it } from 'vitest';
import { ProduceDetailsQuery } from '@composition/ProduceDetailsQuery';
import { toNutrient, toProduce, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { IndexedFarmRepository } from '@contexts/farms/infrastructure/IndexedFarmRepository';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { NUTRIENT_CLAIMS, produceRecord } from '@tests/fixtures/records';

const ON = new Date('2026-11-12T12:00:00+02:00');
const MZH = {
  name: 'МЗХ, Агростатистика: Структура на овощните видове – 2023',
  url: 'https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448.pdf',
};
const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
  new IndexedRepository(async () => items);

const queryFor = (regions: Parameters<typeof produceRecord>[0]['regions']) =>
  new ProduceDetailsQuery({
    produce: repositoryOf([toProduce('yabalki', produceRecord({ regions }))]),
    groups: repositoryOf([
      toProduceGroup('krastotsvetni', {
        name: 'Кръстоцветни',
        latinName: 'Brassicaceae',
        description: 'Описание.',
      }),
    ]),
    nutrients: repositoryOf(
      ['vitamin-c', 'vitamin-k'].map((slug) =>
        toNutrient(slug, {
          name: slug,
          kind: 'vitamin',
          unit: 'mg',
          referenceIntake: 80,
          ...NUTRIENT_CLAIMS,
        }),
      ),
    ),
    regions: repositoryOf([
      toRegion('plovdiv', { name: 'Пловдив' }),
      toRegion('kyustendil', { name: 'Кюстендил' }),
    ]),
    farms: new IndexedFarmRepository(async () => []),
  });

describe('growing region sources (spec 033)', () => {
  it('AC1: resolves a region source and lists it once among the sources', async () => {
    const details = await queryFor([
      { region: 'plovdiv', note: '822 ха през 2023 г.', source: MZH },
      { region: 'kyustendil', note: '436 ха през 2023 г.', source: MZH },
    ]).forSlug('yabalki', ON);
    expect(details.growingRegions.map((entry) => entry.source)).toEqual([MZH, MZH]);
    expect(details.sources.filter((source) => source.url === MZH.url)).toHaveLength(1);
  });

  it('AC2: keeps a region without a source valid', async () => {
    const details = await queryFor([{ region: 'plovdiv', note: 'Редакторска бележка.' }]).forSlug(
      'yabalki',
      ON,
    );
    expect(details.growingRegions[0]?.source).toBeUndefined();
  });
});
