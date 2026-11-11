import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { palettes } from '@design/tokens';

describe('DESIGN.md (spec 022)', () => {
  it('AC6: lists every light and dark palette value', () => {
    const doc = readFileSync('DESIGN.md', 'utf8').toLowerCase();
    const values = [...Object.values(palettes.light), ...Object.values(palettes.dark)];
    expect(values.filter((value) => !doc.includes(value.toLowerCase()))).toEqual([]);
  });
});
