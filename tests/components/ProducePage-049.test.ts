import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type * as Axe from 'axe-core';
import ProduceCard from '@components/produce/ProduceCard.astro';
import SeasonList from '@components/season/SeasonList.astro';
import type * as Composition from '@composition/index';
import { SeasonOverviewService } from '@contexts/catalog';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { Month } from '@contexts/seasonality';
import { testImage } from '@tests/fixtures/photos';
import { produceRepositoryOf } from '@tests/fixtures/produce';
import { MINIMAL_PRODUCE_INPUT } from '@tests/fixtures/records';
import { render, TEST_SITE } from './render';

/**
 * Replaces the produce page's content-backed services with in-memory ones: a minimal produce
 * (`hryan`, spec 049) and one with nutrition only (`zele`), and no sponsor.
 */
vi.mock('@composition/index', async (importOriginal) => {
  const actual = await importOriginal<typeof Composition>();
  const { ProduceDetailsQuery } = await import('@composition/ProduceDetailsQuery');
  const {
    toNutrient,
    toProduce: mapProduce,
    toProduceGroup,
  } = await import('@contexts/catalog/infrastructure/mappers');
  const { produceSchemaWith: schemaWith } =
    await import('@contexts/catalog/infrastructure/schemas');
  const { toRegion } = await import('@contexts/geography/infrastructure/mappers');
  const { IndexedRepository } = await import('@shared/infrastructure/IndexedRepository');
  const { IndexedFarmRepository } =
    await import('@contexts/farms/infrastructure/IndexedFarmRepository');
  const { testImage: image } = await import('@tests/fixtures/photos');
  const {
    MINIMAL_PRODUCE_INPUT: minimal,
    NUTRIENT_CLAIMS,
    produceRecord,
  } = await import('@tests/fixtures/records');
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
  const nutritionOnly = produceRecord({
    preparation: [],
    traditionalUses: [],
    faq: [],
    varieties: [],
  });
  return {
    ...actual,
    produceDetailsQuery: new ProduceDetailsQuery({
      produce: repositoryOf([
        mapProduce('hryan', schemaWith({ image }).parse(minimal)),
        mapProduce('zele', nutritionOnly),
      ]),
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
    sponsorSelectionService: { forPlacement: async () => undefined },
  };
});

const AXE_SOURCE = readFileSync(
  createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
  'utf8',
);
/** WCAG rule tags checked on every page, as in the e2e suite. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
/** Rules that need a rendering engine with layout, which happy-dom does not have. */
const LAYOUT_RULES = ['color-contrast', 'target-size', 'scrollable-region-focusable'];
const OPTIONAL_IDS = [
  'eat',
  'nutrition',
  'preparation',
  'traditional',
  'choose',
  'storage',
  'varieties',
  'grow',
  'faq',
];

const PAGE = '../../src/pages/[section]/[slug].astro';

async function renderPage(slug: string): Promise<string> {
  const container = await AstroContainer.create({ astroConfig: { site: TEST_SITE } });
  const { default: page } = await import(PAGE);
  return container.renderToString(page, { params: { section: 'zelenchutsi', slug } });
}

function windowOf(html: string): Window {
  const window = new Window({ url: `${TEST_SITE}/zelenchutsi/hryan` });
  window.document.write(html);
  return window;
}

const minimalHtml = await renderPage('hryan');
const minimal = windowOf(minimalHtml).document;
const article = minimal.querySelector('article.produce');

describe('minimal produce page (spec 049)', () => {
  it('AC10: renders one h1 and never skips a heading level', () => {
    const levels = [...minimal.querySelectorAll('main h1, main h2, main h3, main h4')].map(
      (heading) => Number(heading.tagName.slice(1)),
    );
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.forEach((level, index) => {
      if (index > 0) expect(level - (levels[index - 1] ?? 1)).toBeLessThanOrEqual(1);
    });
  });

  it('AC10: gives every section content besides its heading', () => {
    for (const section of article?.querySelectorAll('section') ?? []) {
      const content = [...section.children].filter((child) => !/^H[1-6]$/.test(child.tagName));
      expect(content.length, section.getAttribute('aria-labelledby') ?? '').toBeGreaterThan(0);
    }
  });

  it('AC10: links every table of contents entry to an element on the page', () => {
    const targets = [...minimal.querySelectorAll('.produce__toc a')].map((link) =>
      (link.getAttribute('href') ?? '').slice(1),
    );
    expect(targets).toEqual(['stall', 'farms', 'sources']);
    for (const id of targets) expect(minimal.getElementById(id), id).not.toBeNull();
  });

  it('AC10: shows none of the optional sections, no photo, no Latin name and no empty list', () => {
    for (const id of OPTIONAL_IDS) expect(minimal.getElementById(id), id).toBeNull();
    expect(article?.querySelector('figure, picture, img')).toBeNull();
    const latinNames = [...(article?.querySelectorAll('[lang="la"]') ?? [])].filter(
      (element) => element.closest('a[href^="/grupi/"]') === null,
    );
    expect(latinNames, 'only the family link carries a Latin name').toEqual([]);
    for (const list of article?.querySelectorAll('ul, ol, dl') ?? []) {
      expect(list.children.length, list.outerHTML.slice(0, 60)).toBeGreaterThan(0);
    }
  });

  it('AC10: keeps the season section and the Pagefind body', () => {
    expect(minimal.getElementById('season')).not.toBeNull();
    expect(article?.hasAttribute('data-pagefind-body')).toBe(true);
  });

  it('AC11: has no axe violations', async () => {
    const window = windowOf(minimalHtml);
    window.eval(AXE_SOURCE);
    const axe = (window as unknown as { axe: typeof Axe }).axe;
    const results: Axe.AxeResults = await axe.run(window.document as unknown as Document, {
      runOnly: { type: 'tag', values: WCAG_TAGS },
      rules: Object.fromEntries(LAYOUT_RULES.map((rule) => [rule, { enabled: false }])),
    });
    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target.join(' ')),
      })),
    ).toEqual([]);
    await window.happyDOM.close();
  });

  it('AC12: hides nothing with markup and reads header, contents, stall, farms, sources', () => {
    expect(article?.querySelectorAll('[hidden], [style]')).toHaveLength(0);
    const order = [
      article?.querySelector('h1'),
      article?.querySelector('.produce__toc'),
      minimal.getElementById('stall'),
      minimal.getElementById('farms'),
      minimal.getElementById('sources'),
    ];
    const FOLLOWING = 4;
    order.forEach((element, index) => {
      expect(element).not.toBeNull();
      const next = order[index + 1];
      if (element && next)
        expect(element.compareDocumentPosition(next) & FOLLOWING).toBe(FOLLOWING);
    });
  });

  it('AC13: has Article JSON-LD without image, alternate name or citation, and no FAQPage', () => {
    const blocks = [...minimal.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => JSON.parse(script.textContent) as Record<string, unknown>,
    );
    const types = blocks.flatMap((block) =>
      Array.isArray(block)
        ? block.map((item: { '@type': string }) => item['@type'])
        : [block['@type']],
    );
    expect(types).not.toContain('FAQPage');
    const articleLd = blocks
      .flatMap((block) => (Array.isArray(block) ? block : [block]))
      .find((block: Record<string, unknown>) => block['@type'] === 'Article') as
      Record<string, unknown> | undefined;
    expect(articleLd).toBeDefined();
    expect(articleLd).not.toHaveProperty('image');
    expect(articleLd).not.toHaveProperty('citation');
    expect(articleLd?.about).not.toHaveProperty('alternateName');
  });

  it('AC13: lists no sources but still links the methodology', () => {
    const sources = minimal.getElementById('sources')?.closest('section');
    expect(sources?.querySelector('ul')).toBeNull();
    expect(sources?.querySelector('a[href="/metodologiya"]')).not.toBeNull();
  });
});

describe('produce page with nutrition only (spec 049)', () => {
  it('AC14: shows the eat group with the nutrition section only', async () => {
    const document = windowOf(await renderPage('zele')).document;
    expect(document.getElementById('eat')).not.toBeNull();
    expect(document.getElementById('nutrition')).not.toBeNull();
    expect(document.getElementById('preparation')).toBeNull();
    expect(document.getElementById('traditional')).toBeNull();
    expect(document.querySelector('.produce__toc a[href="#eat"]')).not.toBeNull();
  });
});

describe('produce lists without a Latin name (spec 049)', () => {
  const hryan = toProduce(
    'hryan',
    produceSchemaWith({ image: testImage }).parse(MINIMAL_PRODUCE_INPUT),
  );

  it('AC15: ProduceCard renders no Latin name', async () => {
    const html = await render(ProduceCard, { produce: hryan });
    expect(html).toContain('Хрян');
    expect(html).not.toContain('lang="la"');
  });

  it('AC15: SeasonList renders no Latin name', async () => {
    const overview = await new SeasonOverviewService(produceRepositoryOf([hryan])).overviewFor(
      Month.of(11),
    );
    const html = await render(SeasonList, { overview });
    expect(html).toContain('Хрян');
    expect(html).not.toContain('lang="la"');
  });
});
