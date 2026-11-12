import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { ui } from '@i18n/bg';

const PRODUCE_DIR = join(process.cwd(), 'src', 'data', 'produce');
const REVIEW_NOTE = 'редакторска проверка';
const LEEK_WIKIPEDIA = 'https://bg.wikipedia.org/wiki/%D0%9F%D1%80%D0%B0%D0%B7';

interface ProduceFile {
  readonly reviewStatus?: unknown;
  readonly growing?: {
    readonly transplant: ReadonlyArray<number>;
    readonly sources: ReadonlyArray<{ readonly url: string }>;
  };
}

const produceFiles = readdirSync(PRODUCE_DIR).map((file) => ({
  file,
  text: readFileSync(join(PRODUCE_DIR, file), 'utf8'),
}));

/** Collects every string value nested in `value`. */
const strings = (value: unknown): ReadonlyArray<string> => {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') return [];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
};

describe('no review status (spec 034)', () => {
  it('AC1: no produce file has a review status', () => {
    for (const { file, text } of produceFiles) {
      expect((parse(text) as ProduceFile).reviewStatus, file).toBeUndefined();
    }
  });

  it('AC3: no UI string mentions the editorial check, and the methodology has no review section', () => {
    expect(strings(ui).filter((text) => text.includes(REVIEW_NOTE))).toEqual([]);
    expect(Object.keys(ui.methodology)).not.toContain('reviewHeading');
    expect(Object.keys(ui.methodology)).not.toContain('review');
  });

  it('AC5: leek no longer cites gradinata.bg and grows by Wikipedia alone', () => {
    const leek = parse(readFileSync(join(PRODUCE_DIR, 'praz.yaml'), 'utf8')) as ProduceFile;
    expect(leek.growing?.transplant).toEqual([]);
    expect(leek.growing?.sources.map((source) => source.url)).toEqual([LEEK_WIKIPEDIA]);
  });

  it('QA 034: leek shows the date of its growing-guide change', () => {
    const leek = parse(readFileSync(join(PRODUCE_DIR, 'praz.yaml'), 'utf8')) as {
      updatedAt: string;
    };
    expect(String(leek.updatedAt)).toBe('2026-11-12');
  });

  it('QA 034: the checklist marks every produce whose growing guide still cites gradinata.bg', () => {
    const checklist = readFileSync('docs/content-review/README.md', 'utf8');
    for (const { file } of produceFiles.filter(({ text }) => text.includes('gradinata.bg'))) {
      const slug = file.replace('.yaml', '');
      const row = checklist.split('\n').find((line) => line.startsWith(`| \`${slug}\``)) ?? '';
      expect(row, slug).toContain('gradinata.bg');
    }
  });

  it('AC6: the docs no longer describe a review status or a sign-off', () => {
    for (const path of ['docs/content-review/README.md', 'docs/CONTENT-GUIDE.md', 'PRODUCT.md']) {
      const text = readFileSync(path, 'utf8');
      expect(text, path).not.toContain('reviewStatus');
      expect(text, path).not.toContain('`reviewed`');
      expect(text.toLowerCase(), path).not.toMatch(/sign(ed)?[- ]off/);
    }
  });
});
