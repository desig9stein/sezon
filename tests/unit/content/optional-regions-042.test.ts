import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('optional growing regions in the content guide (spec 042)', () => {
  it('AC4: says the region list may be empty only when no official source names a province', () => {
    const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
    expect(guide).toContain('regions: [] # only when no official source names a province');
  });
});
