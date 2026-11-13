import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface TraditionalUse {
  readonly system: string;
  readonly use: string;
  readonly source: { readonly url: string };
}

const usesOf = (slug: string): ReadonlyArray<TraditionalUse> =>
  (
    parse(readFileSync(join(process.cwd(), 'src', 'data', 'produce', `${slug}.yaml`), 'utf8')) as {
      traditionalUses: TraditionalUse[];
    }
  ).traditionalUses;

const PREFIX = 'Традиционно се използва';
const DILL_SOURCE = 'https://doi.org/10.2478/asn-2022-0021';
const PARSLEY_SOURCE = 'https://doi.org/10.1016/S0378-8741(99)00129-4';
const FORBIDDEN = /болест|заболяван|инфекц|аборт|бебе|колики|лекува|предпазва/i;

describe('traditional uses from Bulgarian ethnobotany (spec 039)', () => {
  it('AC1: dill has one folk use from Dragoeva et al. 2022', () => {
    const uses = usesOf('kopar');
    expect(uses).toHaveLength(1);
    expect(uses[0]?.system).toBe('folk');
    expect(uses[0]?.use.startsWith(PREFIX)).toBe(true);
    expect(uses[0]?.source.url).toBe(DILL_SOURCE);
  });

  it('AC2: parsley has one folk use from Ivancheva & Stantcheva 2000', () => {
    const uses = usesOf('magdanoz');
    expect(uses).toHaveLength(1);
    expect(uses[0]?.system).toBe('folk');
    expect(uses[0]?.use.startsWith(PREFIX)).toBe(true);
    expect(uses[0]?.source.url).toBe(PARSLEY_SOURCE);
  });

  it('AC3: cabbage has no traditional use', () => {
    expect(usesOf('zele')).toEqual([]);
  });

  it('AC4: no new use mentions a disease, abortion or infants', () => {
    for (const use of [...usesOf('kopar'), ...usesOf('magdanoz')]) {
      expect(use.use).not.toMatch(FORBIDDEN);
    }
  });

  it('AC5: the checklist shows one traditional use for dill and parsley', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const slug of ['kopar', 'magdanoz']) {
      const row = checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '';
      expect(row.split('|').map((cell) => cell.trim())[4], slug).toBe('1');
    }
  });
});
