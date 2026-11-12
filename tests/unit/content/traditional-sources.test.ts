import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface TraditionalUse {
  readonly source: { readonly url: string };
}

const DIR = join(process.cwd(), 'src', 'data', 'produce');
const PRODUCE = readdirSync(DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => ({
    slug: file.replace(/\.yaml$/, ''),
    uses:
      (parse(readFileSync(join(DIR, file), 'utf8')) as { traditionalUses?: TraditionalUse[] })
        .traditionalUses ?? [],
  }));

describe('traditional-use sources (spec 032)', () => {
  it('AC3: no traditional use cites Wikipedia', () => {
    const wiki = PRODUCE.flatMap(({ slug, uses }) =>
      uses
        .filter((use) => new URL(use.source.url).hostname.endsWith('wikipedia.org'))
        .map(() => slug),
    );
    expect(wiki).toEqual([]);
  });

  it('AC4: dill, parsley and cabbage have no unsourced traditional use', () => {
    for (const slug of ['kopar', 'magdanoz', 'zele']) {
      expect(PRODUCE.find((item) => item.slug === slug)?.uses, slug).toEqual([]);
    }
  });

  it('AC5: the review checklist lists every produce', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const { slug } of PRODUCE) expect(checklist, slug).toContain(`\`${slug}\``);
  });
});
