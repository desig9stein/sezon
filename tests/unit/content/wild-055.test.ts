import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ui } from '@i18n/bg';

const guide = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');

describe('wild produce in the content and the guide (spec 055)', () => {
  it('AC18: the content guide documents wild, cautions and the caution rule', () => {
    expect(guide).toMatch(/^wild: true/m);
    expect(guide).toMatch(/^cautions:/m);
    for (const kind of ['look-alike', 'toxic-part', 'allergy', 'protected', 'preparation']) {
      expect(guide, kind).toContain(kind);
    }
    expect(guide).toMatch(/wild produce needs at least one sourced caution/i);
    expect(guide).toContain('Закон за лечебните растения');
  });

  it('AC18: every wild produce in src/data has at least one caution', () => {
    const files = globSync('src/data/produce/*.yaml');
    expect(files.length).toBeGreaterThan(0);
    const missing = files.filter((file) => {
      const entry = parse(readFileSync(file, 'utf8')) as {
        wild?: boolean;
        cautions?: unknown[];
      };
      return entry.wild === true && (entry.cautions?.length ?? 0) === 0;
    });
    expect(missing).toEqual([]);
  });

  it('AC16: the methodology explains how wild plants and cautions are sourced', () => {
    const methodology = ui.methodology as Record<string, string>;
    expect(methodology.wildHeading).toBe('Диворастящи растения');
    expect(methodology.wild).toContain('Внимание');
    expect(methodology.wild).toContain('източник');
  });
});
