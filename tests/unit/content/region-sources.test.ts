import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

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
    for (const slug of Object.keys(SOURCED)) {
      expect(rowOf(slug), slug).toContain('regions verified');
    }
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
});
