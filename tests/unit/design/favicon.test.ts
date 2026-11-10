import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { palettes } from '@design/tokens';

describe('favicon', () => {
  it('QA 006: uses the light accent token as background', () => {
    const svg = readFileSync(join(process.cwd(), 'public', 'favicon.svg'), 'utf8');
    expect(svg).toContain(`fill="${palettes.light.accent}"`);
  });
});
