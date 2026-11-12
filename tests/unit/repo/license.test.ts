import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('licences (spec 031)', () => {
  it('AC10: code is MIT and content is CC BY 4.0', () => {
    const mit = readFileSync('LICENSE', 'utf8');
    expect(mit).toMatch(/^MIT License/);
    expect(mit).toMatch(/Copyright \(c\) 2026 \S+/);
    expect(mit).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
    const content = readFileSync('LICENSE-CONTENT', 'utf8');
    expect(content).toMatch(/^Attribution 4\.0 International/);
    expect(content).toContain('Section 1 -- Definitions.');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { license?: string };
    expect(pkg.license).toBe('MIT');
  });
});
