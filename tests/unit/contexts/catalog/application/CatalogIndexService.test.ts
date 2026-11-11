import { describe, expect, it } from 'vitest';
import { CatalogIndexService } from '@contexts/catalog';
import { toNutrient, toProduceGroup } from '@contexts/catalog/infrastructure/mappers';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';

const group = (slug: string, name: string) =>
  toProduceGroup(slug, { name, latinName: 'Rosaceae', description: 'Описание.' });
const nutrient = (slug: string, name: string) =>
  toNutrient(slug, {
    name,
    kind: 'mineral',
    unit: 'mg',
    referenceIntake: 100,
    ...NUTRIENT_CLAIMS,
  });

const NOVEMBER = [{ month: 11, level: 'peak' as const }];

const service = new CatalogIndexService(
  produceRepositoryOf([
    aProduce({
      slug: 'zele',
      name: 'Зеле',
      kind: 'vegetable',
      group: 'krastotsvetni',
      season: NOVEMBER,
    }),
    aProduce({
      slug: 'praz',
      name: 'Праз',
      kind: 'vegetable',
      group: 'amarilisovi',
      season: NOVEMBER,
    }),
    aProduce({
      slug: 'yabalki',
      name: 'Ябълки',
      kind: 'fruit',
      group: 'rozotsvetni',
      season: NOVEMBER,
    }),
  ]),
  new IndexedRepository(async () => [
    group('rozotsvetni', 'Розоцветни'),
    group('krastotsvetni', 'Кръстоцветни'),
    group('amarilisovi', 'Амарилисови'),
    group('shtirovi', 'Щирови'),
  ]),
  new IndexedRepository(async () => [nutrient('kaliy', 'Калий'), nutrient('zhelyazo', 'Желязо')]),
);

describe('CatalogIndexService (spec 023)', () => {
  it('AC1: lists the sections in kind order with their counts', async () => {
    const { sections } = await service.index();
    expect(sections.map(({ kind, count }) => [kind, count])).toEqual([
      ['fruit', 1],
      ['vegetable', 2],
      ['herb', 0],
      ['nut', 0],
    ]);
  });

  it('AC1: lists the groups by name with their counts, empty groups included', async () => {
    const { groups } = await service.index();
    expect(groups.map(({ group: { slug }, count }) => [slug, count])).toEqual([
      ['amarilisovi', 1],
      ['krastotsvetni', 1],
      ['rozotsvetni', 1],
      ['shtirovi', 0],
    ]);
  });

  it('AC1: lists the nutrients by name', async () => {
    const { nutrients } = await service.index();
    expect(nutrients.map(({ slug }) => slug)).toEqual(['zhelyazo', 'kaliy']);
  });
});
