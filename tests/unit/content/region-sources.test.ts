import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchema } from '@contexts/catalog/infrastructure/schemas';
import { ui } from '@i18n/bg';
import { produceRecord } from '@tests/fixtures/records';

interface RegionEntry {
  readonly region: string;
  readonly note: string;
  readonly source?: { readonly name: string; readonly url: string };
}

const regionsOf = (slug: string): RegionEntry[] =>
  (
    parse(readFileSync(join(process.cwd(), 'src', 'data', 'produce', `${slug}.yaml`), 'utf8')) as {
      regions: RegionEntry[];
    }
  ).regions;

/** Provinces backed by МЗХ agrostatistics, in the order of the data (spec 033). */
const SOURCED: Readonly<Record<string, ReadonlyArray<string>>> = {
  yabalki: ['plovdiv', 'kyustendil'],
  krushi: ['haskovo', 'plovdiv'],
  orehi: ['stara-zagora', 'plovdiv', 'shumen'],
  zele: ['plovdiv', 'pazardzhik'],
};

describe('growing regions from official statistics (spec 033)', () => {
  it.each(Object.entries(SOURCED))(
    'AC3: %s lists the МЗХ provinces with a source',
    (slug, expected) => {
      const regions = regionsOf(slug);
      expect(regions.map((entry) => entry.region)).toEqual(expected);
      for (const entry of regions) {
        expect(entry.source, `${slug}/${entry.region}`).toBeDefined();
        expect(new URL(entry.source?.url ?? 'https://invalid').hostname).toBe(
          'www.mzh.government.bg',
        );
      }
    },
  );

  it('AC4: the checklist records the region status of every produce', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    const rowOf = (slug: string) =>
      checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '';
    for (const slug of ['yabalki', 'krushi', 'orehi']) {
      expect(rowOf(slug), slug).toContain('regions verified');
    }
    expect(rowOf('zele')).toContain('NUTS2');
    for (const slug of [
      'dyuli',
      'kopar',
      'magdanoz',
      'morkovi',
      'praz',
      'spanak',
      'tikva',
      'tselina',
      'tsveklo',
    ]) {
      expect(rowOf(slug), slug).toContain('no official provincial data');
    }
  });

  it('AC5: every sourced note stands alone and cites the exact МЗХ publication title', () => {
    for (const slug of Object.keys(SOURCED)) {
      for (const entry of regionsOf(slug)) {
        expect(entry.note, `${slug}/${entry.region}`).not.toMatch(/^Също/);
        if (slug !== 'zele') {
          expect(entry.source?.name, slug).toContain(
            'Структура на основни овощни видове в България през 2023',
          );
        }
      }
    }
  });

  it('AC6: the methodology and about pages say which region notes are sourced', () => {
    expect(ui.methodology.regions).not.toContain('още нямат отделни източници');
    expect(ui.methodology.regions).toContain('МЗХ');
    expect(ui.about.sources).toContain('МЗХ');
  });

  it('AC2: the content schema accepts a region without a source', () => {
    const record = produceRecord({ regions: [{ region: 'plovdiv', note: 'Бележка.' }] });
    expect(produceSchema.safeParse(record).success).toBe(true);
  });
});
