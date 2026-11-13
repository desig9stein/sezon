import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type Axe from 'axe-core';
import ProduceCard from '@components/produce/ProduceCard.astro';
import SeasonList from '@components/season/SeasonList.astro';
import type * as Composition from '@composition/index';
import { SeasonOverviewService } from '@contexts/catalog';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { Month } from '@contexts/seasonality';
import { produceSeasonTitle } from '@i18n/bg';
import { testImage } from '@tests/fixtures/photos';
import { produceRepositoryOf } from '@tests/fixtures/produce';
import {
  CAUTION_SOURCE,
  MINIMAL_PRODUCE_INPUT,
  SECOND_CAUTION_SOURCE,
  WILD_PRODUCE_INPUT,
} from '@tests/fixtures/records';
import { render, TEST_SITE } from './render';

/** A test-only allergy caution for a cultivated produce. */
const ALLERGY_CAUTION = {
  kind: 'allergy',
  text: 'Тестов текст за алергия към културното растение.',
  source: CAUTION_SOURCE,
};

/**
 * Replaces the produce page's content-backed services with in-memory ones: a wild produce with two
 * cautions (`gluharche`), a cultivated one with an allergy caution (`hryan`) and a minimal one
 * without cautions (`ryapa`), no farm, no sponsor and no recipe.
 */
vi.mock('@composition/index', async (importOriginal) => {
  const actual = await importOriginal<typeof Composition>();
  const { ProduceDetailsQuery } = await import('@composition/ProduceDetailsQuery');
  const { toProduce: mapProduce, toProduceGroup } =
    await import('@contexts/catalog/infrastructure/mappers');
  const { produceSchemaWith: schemaWith } =
    await import('@contexts/catalog/infrastructure/schemas');
  const { IndexedRepository } = await import('@shared/infrastructure/IndexedRepository');
  const { IndexedFarmRepository } =
    await import('@contexts/farms/infrastructure/IndexedFarmRepository');
  const { testImage: image } = await import('@tests/fixtures/photos');
  const records = await import('@tests/fixtures/records');
  const parse = (input: unknown) => schemaWith({ image }).parse(input);
  const repositoryOf = <T extends { slug: string; name: string }>(items: T[]) =>
    new IndexedRepository(async () => items);
  return {
    ...actual,
    produceDetailsQuery: new ProduceDetailsQuery({
      produce: repositoryOf([
        mapProduce('gluharche', parse(records.WILD_PRODUCE_INPUT)),
        mapProduce(
          'hryan',
          parse({
            ...records.MINIMAL_PRODUCE_INPUT,
            cautions: [
              {
                kind: 'allergy',
                text: 'Тестов текст за алергия към културното растение.',
                source: records.CAUTION_SOURCE,
              },
            ],
          }),
        ),
        mapProduce('ryapa', parse({ ...records.MINIMAL_PRODUCE_INPUT, name: 'Ряпа' })),
      ]),
      groups: repositoryOf([
        toProduceGroup('slozhnotsvetni', {
          name: 'Сложноцветни',
          latinName: 'Asteraceae',
          description: 'Описание.',
        }),
        toProduceGroup('krastotsvetni', {
          name: 'Кръстоцветни',
          latinName: 'Brassicaceae',
          description: 'Описание.',
        }),
      ]),
      nutrients: repositoryOf([]),
      regions: repositoryOf([]),
      farms: new IndexedFarmRepository(async () => []),
    }),
    sponsorSelectionService: { forPlacement: async () => undefined },
    recipeIndexService: { forProduce: async () => [] },
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
const FOLLOWING = 4;
const WILD_LABEL = 'Диворастящ';
const CAUTIONS_HEADING = 'Внимание';
const GATHERING_NOTE_START = 'Събирай само';

const PAGE = '../../src/pages/[section]/[slug].astro';

async function renderPage(slug: string): Promise<string> {
  const container = await AstroContainer.create({ astroConfig: { site: TEST_SITE } });
  const { default: page } = await import(PAGE);
  return container.renderToString(page, { params: { section: 'podpravki', slug } });
}

function windowOf(html: string): Window {
  const window = new Window({ url: `${TEST_SITE}/podpravki/gluharche` });
  window.document.write(html);
  return window;
}

const follows = (first: Element | null | undefined, second: Element | null | undefined) =>
  first !== null &&
  first !== undefined &&
  second !== null &&
  second !== undefined &&
  (first.compareDocumentPosition(second) & FOLLOWING) === FOLLOWING;

const wildHtml = await renderPage('gluharche');
const wild = windowOf(wildHtml).document;
const cautionsSection = wild.getElementById('cautions')?.closest('section');

describe('wild produce page (spec 055)', () => {
  it('AC10: puts an h3 „Внимание“ in the stall after the level line and before the season', () => {
    const heading = wild.getElementById('cautions');
    expect(heading?.tagName).toBe('H3');
    expect(heading?.textContent?.trim()).toBe(CAUTIONS_HEADING);
    const stall = wild.getElementById('stall');
    expect(stall?.contains(heading as unknown as Node)).toBe(true);
    expect(follows(stall?.querySelector('.produce-now'), heading)).toBe(true);
    expect(follows(heading, wild.getElementById('season'))).toBe(true);
  });

  it('AC10: comes before the eat group, the farms and the sources', () => {
    const heading = wild.getElementById('cautions');
    for (const id of ['farms', 'sources']) {
      expect(follows(heading, wild.getElementById(id)), id).toBe(true);
    }
    const eat = wild.getElementById('eat');
    if (eat !== null) expect(follows(heading, eat)).toBe(true);
  });

  it('AC11: shows the gathering note and one item per caution with label, text, icon and source', () => {
    expect(cautionsSection?.textContent).toContain(GATHERING_NOTE_START);
    const items = [...(cautionsSection?.querySelectorAll('li') ?? [])];
    expect(items).toHaveLength(WILD_PRODUCE_INPUT.cautions.length);
    const [first, second] = items;
    expect(first?.textContent).toContain('Отровни двойници');
    expect(first?.textContent).toContain(WILD_PRODUCE_INPUT.cautions[0]?.text);
    expect(first?.querySelector(`a[href="${CAUTION_SOURCE.url}"]`)?.textContent).toBe(
      CAUTION_SOURCE.name,
    );
    expect(second?.textContent).toContain('Защитен вид');
    expect(second?.querySelector(`a[href="${SECOND_CAUTION_SOURCE.url}"]`)).not.toBeNull();
    for (const item of items) {
      const icon = item.querySelector('svg');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(icon?.getAttribute('width')).toBe('16');
      expect(icon?.getAttribute('height')).toBe('16');
    }
  });

  it('AC11: lists the caution sources in „Източници“', () => {
    const sources = wild.getElementById('sources')?.closest('section');
    for (const source of [CAUTION_SOURCE, SECOND_CAUTION_SOURCE]) {
      expect(sources?.querySelector(`a[href="${source.url}"]`), source.url).not.toBeNull();
    }
  });

  it('AC12: has one h1, no skipped level and a table of contents that resolves', () => {
    const levels = [...wild.querySelectorAll('main h1, main h2, main h3, main h4')].map((heading) =>
      Number(heading.tagName.slice(1)),
    );
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    levels.forEach((level, index) => {
      if (index > 0) expect(level - (levels[index - 1] ?? 1)).toBeLessThanOrEqual(1);
    });
    const targets = [...wild.querySelectorAll('.produce__toc a')].map((link) =>
      (link.getAttribute('href') ?? '').slice(1),
    );
    expect(targets).toEqual(['stall', 'cautions', 'farms', 'sources']);
    for (const id of targets) expect(wild.getElementById(id), id).not.toBeNull();
  });

  it('AC12: is not a live region and hides nothing with markup', () => {
    const article = wild.querySelector('article.produce');
    expect(article?.querySelectorAll('[role="alert"], [role="status"], [aria-live]')).toHaveLength(
      0,
    );
    expect(article?.querySelectorAll('[hidden], [style]')).toHaveLength(0);
  });

  it('AC12: has no axe violations', async () => {
    const window = windowOf(wildHtml);
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

  it('AC13: shows „Диворастящ“ in the header meta', () => {
    const meta = wild.querySelector('.produce__meta');
    expect(
      [...(meta?.querySelectorAll('li') ?? [])].map((item) => item.textContent?.trim()),
    ).toContain(WILD_LABEL);
  });

  it('AC14: keeps the title and description and cites the cautions without their text', () => {
    expect(wild.title).toBe(`${produceSeasonTitle(WILD_PRODUCE_INPUT.name)} | Сезон`);
    expect(wild.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      WILD_PRODUCE_INPUT.summary,
    );
    const ld = [...wild.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => script.textContent)
      .join('\n');
    expect(ld).toContain(CAUTION_SOURCE.url);
    expect(ld).toContain(SECOND_CAUTION_SOURCE.url);
    for (const caution of WILD_PRODUCE_INPUT.cautions) expect(ld).not.toContain(caution.text);
  });
});

describe('produce pages without wild status (spec 055)', () => {
  it('AC13: a cultivated produce with a caution has the section without note or label', async () => {
    const document = windowOf(await renderPage('hryan')).document;
    const section = document.getElementById('cautions')?.closest('section');
    expect(section).not.toBeNull();
    expect(section?.textContent).toContain('Алергия');
    expect(section?.textContent).toContain(ALLERGY_CAUTION.text);
    expect(section?.textContent).not.toContain(GATHERING_NOTE_START);
    expect(document.querySelector('.produce__meta')?.textContent).not.toContain(WILD_LABEL);
  });

  it('AC13: a produce without cautions has no section, no entry and no label', async () => {
    const document = windowOf(await renderPage('ryapa')).document;
    expect(document.getElementById('cautions')).toBeNull();
    expect(document.querySelector('.produce__toc a[href="#cautions"]')).toBeNull();
    expect(document.querySelector('article.produce')?.textContent).not.toContain(WILD_LABEL);
  });
});

describe('produce lists with a wild produce (spec 055)', () => {
  const schema = produceSchemaWith({ image: testImage });
  const gluharche = toProduce('gluharche', schema.parse(WILD_PRODUCE_INPUT));
  const hryan = toProduce('hryan', schema.parse(MINIMAL_PRODUCE_INPUT));

  it.each(['plate', 'index'] as const)('AC15: the %s card shows „Диворастящ“', async (variant) => {
    expect(await render(ProduceCard, { produce: gluharche, variant })).toContain(WILD_LABEL);
    expect(await render(ProduceCard, { produce: hryan, variant })).not.toContain(WILD_LABEL);
  });

  it('AC15: the season list row shows „Диворастящ“ only for the wild produce', async () => {
    const overview = await new SeasonOverviewService(
      produceRepositoryOf([gluharche, hryan]),
    ).overviewFor(Month.of(11));
    const window = windowOf(await render(SeasonList, { overview }));
    const rows = [...window.document.querySelectorAll('.season-row')];
    const rowOf = (name: string) => rows.find((row) => row.textContent?.includes(name));
    expect(rowOf('Глухарче')?.textContent).toContain(WILD_LABEL);
    expect(rowOf('Хрян')?.textContent).not.toContain(WILD_LABEL);
  });
});
