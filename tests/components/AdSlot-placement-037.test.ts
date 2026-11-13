import { describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type * as Composition from '@composition/index';
import { TEST_SITE } from './render';

/**
 * Replaces the content-backed services the produce and month pages use with in-memory ones, and
 * makes the sponsor selection return a sponsor for every placement.
 */
vi.mock('@composition/index', async (importOriginal) => {
  const actual = await importOriginal<typeof Composition>();
  const { Sponsor } = await import('@contexts/advertising');
  const { sponsorInput } = await import('@tests/fixtures/sponsors');
  const { default: image } = await import('../../src/assets/produce/zele.jpg');
  const { ProduceDetailsQuery } = await import('@composition/ProduceDetailsQuery');
  const { toNutrient, toProduce, toProduceGroup } =
    await import('@contexts/catalog/infrastructure/mappers');
  const { toRegion } = await import('@contexts/geography/infrastructure/mappers');
  const { IndexedRepository } = await import('@shared/infrastructure/IndexedRepository');
  const { IndexedFarmRepository } =
    await import('@contexts/farms/infrastructure/IndexedFarmRepository');
  const { NUTRIENT_CLAIMS, produceRecord } = await import('@tests/fixtures/records');
  const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
    new IndexedRepository(async () => items);
  const nutrient = (slug: string, name: string) =>
    toNutrient(slug, {
      name,
      kind: 'vitamin',
      unit: 'mg',
      referenceIntake: 80,
      ...NUTRIENT_CLAIMS,
    });
  return {
    ...actual,
    produceDetailsQuery: new ProduceDetailsQuery({
      produce: repositoryOf([toProduce('zele', produceRecord())]),
      groups: repositoryOf([
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([
        nutrient('vitamin-c', 'Витамин C'),
        nutrient('vitamin-k', 'Витамин K'),
      ]),
      regions: repositoryOf([toRegion('plovdiv', { name: 'Пловдив' })]),
      farms: new IndexedFarmRepository(async () => []),
    }),
    sponsorSelectionService: {
      forPlacement: async (placement: 'produce' | 'month') =>
        Sponsor.create(sponsorInput({ id: `${placement}-sponsor`, image, placement })),
    },
  };
});

const parse = (html: string) => new new Window().DOMParser().parseFromString(html, 'text/html');

async function renderPage(path: string, params: Record<string, string>) {
  const container = await AstroContainer.create({ astroConfig: { site: TEST_SITE } });
  const { default: page } = await import(path);
  return parse(await container.renderToString(page, { params }));
}

describe('ad slot placement on pages (QA 037)', () => {
  it('QA 037: the produce slot is a direct child of the article, after #eat, outside sections', async () => {
    const document = await renderPage('../../src/pages/[section]/[slug].astro', {
      section: 'zelenchutsi',
      slug: 'zele',
    });
    const slots = document.querySelectorAll('aside.ad-slot');
    expect(slots).toHaveLength(1);
    const slot = slots[0]!;
    expect(slot.parentElement?.tagName).toBe('ARTICLE');
    expect(slot.closest('section')).toBeNull();
    expect(slot.previousElementSibling?.id).toBe('eat');
  });

  it('QA 037: the month slot sits in main before the month pager, outside sections', async () => {
    const document = await renderPage('../../src/pages/sezon/[month].astro', { month: 'noemvri' });
    const slots = document.querySelectorAll('aside.ad-slot');
    expect(slots).toHaveLength(1);
    const slot = slots[0]!;
    expect(slot.closest('section')).toBeNull();
    expect(slot.closest('main')).not.toBeNull();
    const pager = document.querySelector('nav.month-pager');
    expect(pager).not.toBeNull();
    const FOLLOWING = 4;
    expect(slot.compareDocumentPosition(pager!) & FOLLOWING).toBe(FOLLOWING);
  });

  it('QA 037: each slot is named by its visible label through a unique id', async () => {
    const document = await renderPage('../../src/pages/sezon/[month].astro', { month: 'noemvri' });
    const slot = document.querySelector('aside.ad-slot')!;
    expect(slot.hasAttribute('aria-label')).toBe(false);
    const labelId = slot.getAttribute('aria-labelledby') ?? '';
    expect(labelId).toContain('month');
    expect(document.getElementById(labelId)?.textContent).toBe('Реклама');
  });
});
