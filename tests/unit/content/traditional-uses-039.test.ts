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
      traditionalUses?: TraditionalUse[];
    }
  ).traditionalUses ?? [];

const PREFIX = 'Традиционно се използва';
const DILL_SOURCE = 'https://doi.org/10.2478/asn-2022-0021';
const FORBIDDEN =
  /болест|заболяван|инфекц|аборт|бебе|колик|колит|кърмач|новород|бремен|безсъни|кръвн|спазм|сърд|лекува|предпазва/i;

describe('traditional uses from Bulgarian ethnobotany (spec 039)', () => {
  it('AC1: dill has one folk use from Dragoeva et al. 2022', () => {
    const uses = usesOf('kopar');
    expect(uses).toHaveLength(1);
    expect(uses[0]?.system).toBe('folk');
    expect(uses[0]?.use.startsWith(PREFIX)).toBe(true);
    expect(uses[0]?.source.url).toBe(DILL_SOURCE);
  });

  it('AC2: parsley has no traditional use: its source row also records an abortion effect and the site cannot show a caution', () => {
    expect(usesOf('magdanoz')).toEqual([]);
  });

  it('QA 039: the dill use follows the „при …“ template and names no plant part', () => {
    const use = usesOf('kopar')[0]?.use ?? '';
    expect(use).toMatch(/ при /);
    expect(use).not.toMatch(/лист|стрък|семе|плод|корен/i);
  });

  it('AC3: cabbage has no traditional use', () => {
    expect(usesOf('zele')).toEqual([]);
  });

  it('AC4: the dill use does not mention a disease, abortion or infants', () => {
    for (const use of usesOf('kopar')) {
      expect(use.use).not.toMatch(FORBIDDEN);
    }
  });

  it('AC5: the checklist shows one traditional use for dill and none for parsley', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    const usesIn = (slug: string) =>
      (checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '')
        .split('|')
        .map((cell) => cell.trim())[4];
    expect(usesIn('kopar')).toBe('1');
    expect(usesIn('magdanoz')).toBe('0');
  });
});
