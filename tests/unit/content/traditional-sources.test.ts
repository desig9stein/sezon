import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface TraditionalUse {
  readonly source: { readonly url: string };
}

interface ProduceRecord {
  readonly traditionalUses?: TraditionalUse[];
  readonly nutrition: { readonly source: { readonly url: string } };
}

const DIR = join(process.cwd(), 'src', 'data', 'produce');
const PRODUCE = readdirSync(DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => {
    const record = parse(readFileSync(join(DIR, file), 'utf8')) as ProduceRecord;
    return {
      slug: file.replace(/\.yaml$/, ''),
      uses: record.traditionalUses ?? [],
      fdcId: /\/food-details\/(\d+)\//.exec(record.nutrition.source.url)?.[1] ?? '',
    };
  });

describe('traditional-use sources (spec 032)', () => {
  it('AC3: no traditional use cites Wikipedia', () => {
    const wiki = PRODUCE.flatMap(({ slug, uses }) =>
      uses
        .filter((use) => new URL(use.source.url).hostname.endsWith('wikipedia.org'))
        .map(() => slug),
    );
    expect(wiki).toEqual([]);
  });

  it('AC4: the removed Wikipedia-sourced uses of dill, parsley and cabbage are gone', () => {
    const removed = [
      'https://en.wikipedia.org/wiki/Dill',
      'https://en.wikipedia.org/wiki/Parsley',
      'https://en.wikipedia.org/wiki/Cabbage',
    ];
    const cited = PRODUCE.flatMap(({ uses }) => uses.map((use) => use.source.url));
    expect(cited.filter((url) => removed.includes(url))).toEqual([]);
  });

  it('AC5: the review checklist has a row per produce with its FDC record and open items', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    const rows = new Map(
      checklist
        .split('\n')
        .filter((line) => line.startsWith('| `'))
        .map((line) => {
          const cells = line.split('|').map((cell) => cell.trim());
          return [cells[1]?.replace(/`/g, ''), cells] as const;
        }),
    );
    for (const { slug, fdcId } of PRODUCE) {
      const cells = rows.get(slug);
      expect(cells, slug).toBeDefined();
      expect(cells?.[3], `${slug} nutrition`).toContain(fdcId);
      expect(cells?.[5], `${slug} open items`).toMatch(/\S/);
    }
  });
});
