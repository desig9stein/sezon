import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { parsePlan } from '../../../../scripts/planning/plan.ts';

describe('.github/planning.yml', () => {
  it('AC9: is a valid plan', () => {
    const raw: unknown = parse(readFileSync('.github/planning.yml', 'utf8'));

    expect(() => parsePlan(raw)).not.toThrow();
  });
});
