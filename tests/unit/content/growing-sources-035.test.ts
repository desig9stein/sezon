import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const PRODUCE_DIR = join(process.cwd(), 'src', 'data', 'produce');
const BANNED_HOST = 'gradinata.bg';
const CHANGED = [
  'dyuli',
  'kopar',
  'krushi',
  'magdanoz',
  'orehi',
  'tikva',
  'tselina',
  'tsveklo',
  'yabalki',
  'zele',
] as const;
const CHANGE_DATE = '2026-11-12';

describe('growing guides without gradinata.bg (spec 035)', () => {
  it('AC1: no produce file cites gradinata.bg', () => {
    for (const file of readdirSync(PRODUCE_DIR)) {
      expect(readFileSync(join(PRODUCE_DIR, file), 'utf8'), file).not.toContain(BANNED_HOST);
    }
  });

  it('AC3: every changed produce shows the date of the change', () => {
    for (const slug of CHANGED) {
      const produce = parse(readFileSync(join(PRODUCE_DIR, `${slug}.yaml`), 'utf8')) as {
        updatedAt: string;
      };
      expect(String(produce.updatedAt), slug).toBe(CHANGE_DATE);
    }
  });

  it('AC4: the checklist no longer mentions gradinata.bg', () => {
    expect(readFileSync('docs/content-review/README.md', 'utf8')).not.toContain(BANNED_HOST);
  });
});
