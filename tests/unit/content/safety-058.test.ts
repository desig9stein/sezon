import { globSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import keystaticConfig from '../../../keystatic.config';
import { ui } from '@i18n/bg';

interface Caution {
  readonly kind: string;
  readonly text: string;
  readonly source: { readonly name: string; readonly url: string };
}

interface ProduceRecord {
  readonly wild?: boolean;
  readonly notEatenRaw?: boolean;
  readonly nutrition?: unknown;
  readonly cautions?: ReadonlyArray<Caution>;
}

interface RecipeRecord {
  readonly category: string;
  readonly processingMinutes: number;
  readonly processingAtAltitude?: ReadonlyArray<{ fromMetres: number; minutes: number }>;
  readonly safety: { readonly sterilisation: string };
}

interface FarmRecord {
  readonly description: string;
  readonly produce: ReadonlyArray<string>;
  readonly sources: ReadonlyArray<string>;
}

/** Lowest-band minutes and higher bands of each recipe's jar, from its NCHFP table (spec 058). */
const EXPECTED_BANDS: Readonly<
  Record<string, { lowest: number; bands: ReadonlyArray<{ fromMetres: number; minutes: number }> }>
> = {
  'kiselo-zele': {
    lowest: 15,
    bands: [
      { fromMetres: 300, minutes: 20 },
      { fromMetres: 1800, minutes: 25 },
    ],
  },
  'kompot-ot-krushi': {
    lowest: 25,
    bands: [
      { fromMetres: 300, minutes: 30 },
      { fromMetres: 900, minutes: 35 },
      { fromMetres: 1800, minutes: 40 },
    ],
  },
  'kompot-ot-praskovi': {
    lowest: 30,
    bands: [
      { fromMetres: 300, minutes: 35 },
      { fromMetres: 900, minutes: 40 },
      { fromMetres: 1800, minutes: 45 },
    ],
  },
  'sladko-ot-sini-slivi': {
    lowest: 5,
    bands: [
      { fromMetres: 300, minutes: 10 },
      { fromMetres: 1800, minutes: 15 },
    ],
  },
  'sladko-ot-yabalki': {
    lowest: 5,
    bands: [
      { fromMetres: 300, minutes: 10 },
      { fromMetres: 1800, minutes: 15 },
    ],
  },
};

const read = <T>(file: string): T => parse(readFileSync(file, 'utf8')) as T;
const produceOf = (slug: string) => read<ProduceRecord>(`src/data/produce/${slug}.yaml`);
const farmOf = (slug: string) => read<FarmRecord>(`src/data/farms/${slug}.yaml`);
const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');

const ZLR_URL = 'https://faolex.fao.org/docs/pdf/bul40297.pdf';
const ORDER_2026_URL =
  'https://www.moew.government.bg/static/media/ups/tiny/filebase/Nature/Legislation/Zapovedi/MedicinalPlants/RD-178-18.02.2026-MedPlants.pdf';
const BFR_URL =
  'https://www.bfr.bund.de/presseinformation/geruchstest-mit-tuecken-worauf-beim-baerlauch-sammeln-geachtet-werden-sollte/';
const PIROGOV_URL = 'https://pirogov.eu/bg/klinika-po-toksikologiia_p12.html';
const MVR_112_HOST_PATH = 'https://www.mvr.bg/112/';
const TRACES_URL =
  'https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/BG-BIO-18.100-0004936.2026.001.pdf';

describe('safety and content accuracy (spec 058)', () => {
  it.each(['cheren-baz', 'yaponska-dyulya', 'kopriva'])(
    'AC2: %s is marked not eaten raw and has no nutrition',
    (slug) => {
      const record = produceOf(slug);
      expect(record.notEatenRaw).toBe(true);
      expect(record.nutrition).toBeUndefined();
    },
  );

  it('AC2: no produce marked not eaten raw has nutrition', () => {
    const offenders = globSync('src/data/produce/*.yaml')
      .filter((file) => {
        const record = read<ProduceRecord>(file);
        return record.notEatenRaw === true && record.nutrition !== undefined;
      })
      .map((file) => basename(file, '.yaml'));
    expect(offenders).toEqual([]);
  });

  it('AC3: ramsons warns that hands smelling of garlic defeat the smell test (BfR)', () => {
    const bfr = (produceOf('levurda').cautions ?? []).filter(
      (caution) => caution.source.url === BFR_URL,
    );
    expect(bfr).toHaveLength(1);
    expect(bfr[0]?.kind).toBe('look-alike');
    expect(bfr[0]?.text).toMatch(/ръцете/);
    expect(bfr[0]?.text).toMatch(/чесън/);
    expect(bfr[0]?.text).toMatch(/измий/);
    expect(bfr[0]?.source.name).toMatch(/BfR/);
    expect(bfr[0]?.source.name).toMatch(/2025/);
    expect(bfr[0]?.text).not.toContain('Ако листото не мирише на чесън, не го бери');
  });

  it('AC4: the emergency line tells the reader to call 112 and gives no other number', () => {
    const { emergency } = ui.produce.cautions as unknown as {
      emergency: { text: string; number: string; href: string };
    };
    expect(`${emergency.text} ${emergency.number}.`).toBe(
      'При съмнение за отравяне веднага звъни на 112.',
    );
    expect(emergency.href).toBe('tel:112');
    expect(JSON.stringify(emergency)).not.toMatch(/9154|Пирогов/);
  });

  it('AC6: the methodology states the wild rule, the emergency line and its sources', () => {
    const methodology = ui.methodology as Record<string, unknown>;
    expect(methodology.wild).toMatch(/описва/);
    expect(methodology.wild).toMatch(/шипка/);
    expect(methodology.wild).toMatch(/не отбелязваме/);
    expect(methodology.emergency).toMatch(/112/);
    expect(methodology.emergency).toMatch(/Пирогов/);
    expect(methodology.emergency).toMatch(/лекува остри отравяния/);
    expect(methodology.emergency).not.toMatch(/9154/);
    // No quotation inside a quotation: every „ closes with “ before the next „ opens.
    expect(String(methodology.emergency)).not.toMatch(/„[^“]*„/);
    const links = methodology.emergencySources as ReadonlyArray<{ name: string; url: string }>;
    const urls = links.map((link) => link.url);
    expect(urls).toContain(PIROGOV_URL);
    expect(urls.some((url) => url.startsWith(MVR_112_HOST_PATH))).toBe(true);
    expect(methodology.nutrition).toMatch(/не се ядат сурови/);
  });

  it('AC7: cornelian cherry is wild with a Medicinal Plants Act caution for 10 kg of fruit', () => {
    const record = produceOf('drenki');
    expect(record.wild).toBe(true);
    const zlr = (record.cautions ?? []).filter((caution) => caution.source.url === ZLR_URL);
    expect(zlr.map((caution) => caution.kind)).toEqual(['protected']);
    expect(zlr[0]?.text).toContain('10 кг плодове');
  });

  it.each([
    ['malini', '10 кг плодове'],
    ['kiselets', '1 кг листа'],
  ])('AC7: %s has the Medicinal Plants Act caution for %s and stays unmarked', (slug, amount) => {
    const record = produceOf(slug);
    const zlr = (record.cautions ?? []).filter((caution) => caution.source.url === ZLR_URL);
    expect(zlr.map((caution) => caution.kind)).toEqual(['protected']);
    expect(zlr[0]?.text).toContain(amount);
    expect(zlr[0]?.text).toContain('позволително');
    expect(record.wild ?? false).toBe(false);
  });

  it('AC7: oregano keeps the 2026 order first and adds the Act caution for 2 kg of stems', () => {
    const cautions = produceOf('rigan').cautions ?? [];
    expect(cautions[0]?.source.url).toBe(ORDER_2026_URL);
    const zlr = cautions.filter((caution) => caution.source.url === ZLR_URL);
    expect(zlr).toHaveLength(1);
    expect(zlr[0]?.kind).toBe('protected');
    expect(zlr[0]?.text).toContain('2 кг стръкове');
    expect(produceOf('rigan').wild ?? false).toBe(false);
  });

  it('AC11: every recipe has altitude bands whose minutes appear in its sterilisation text', () => {
    const files = globSync('src/data/recipes/*.yaml');
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const recipe = read<RecipeRecord>(file);
      const bands = recipe.processingAtAltitude ?? [];
      expect(bands.length, file).toBeGreaterThan(0);
      for (const { fromMetres, minutes } of bands) {
        expect(recipe.safety.sterilisation, `${file} ${fromMetres}`).toContain(`${fromMetres} м`);
        expect(recipe.safety.sterilisation, `${file} ${minutes}`).toMatch(
          new RegExp(`(?<!\\d)${minutes}(?!\\d)`),
        );
      }
    }
  });

  it.each(Object.entries(EXPECTED_BANDS))(
    'AC11: %s has the altitude bands of its NCHFP table',
    (slug, { lowest, bands }) => {
      const recipe = read<RecipeRecord>(`src/data/recipes/${slug}.yaml`);
      expect(recipe.processingMinutes).toBe(lowest);
      expect(recipe.processingAtAltitude).toEqual(bands);
    },
  );

  it('AC11: every recipe has its expected bands listed', () => {
    const slugs = globSync('src/data/recipes/*.yaml').map((file) => basename(file, '.yaml'));
    expect(slugs.sort()).toEqual(Object.keys(EXPECTED_BANDS).sort());
  });

  it('AC13: ВКУСнаГРАДИНА says its certificate covers strawberries', () => {
    const farm = farmOf('vkusnagradina');
    expect(farm.produce).toContain('yagodi');
    expect(farm.description).toMatch(/ягоди/);
    expect(farm.sources).toContain(TRACES_URL);
  });

  it('AC13: Джумерски names no site produce outside its produce list', () => {
    const farm = farmOf('gradina-dzhumerski');
    const names = globSync('src/data/produce/*.yaml').map((file) => ({
      slug: basename(file, '.yaml'),
      name: read<{ name: string }>(file).name.toLowerCase(),
    }));
    const listed = names.filter(({ slug }) => farm.produce.includes(slug));
    // Remove the listed names first, longest first, so „зелен лук“ does not count as „лук“.
    const rest = [...listed]
      .sort((a, b) => b.name.length - a.name.length)
      .reduce((text, { name }) => text.replaceAll(name, ' '), farm.description.toLowerCase());
    const named = names
      .filter(({ slug }) => !farm.produce.includes(slug))
      .filter(({ name }) => new RegExp(`(?<!\\p{L})${name}(?!\\p{L})`, 'u').test(rest))
      .map(({ slug }) => slug);
    expect(named).toEqual([]);
    expect(farm.description).not.toMatch(/пащърнак/);
  });

  it('AC14: the content guide documents the new rules', () => {
    expect(guide).toContain('notEatenRaw');
    expect(guide).toContain('processingAtAltitude');
    expect(guide).toMatch(/112/);
    expect(guide).not.toContain('Do not write what to do after poisoning');
    expect(guide).toMatch(/describes gathering .*from the wild/i);
  });

  it('AC14: Keystatic edits notEatenRaw and the altitude bands', () => {
    const collections = keystaticConfig.collections as Record<
      string,
      { schema: Record<string, unknown> }
    >;
    expect(collections.produce?.schema).toHaveProperty('notEatenRaw');
    expect(collections.recipes?.schema).toHaveProperty('processingAtAltitude');
  });
});
