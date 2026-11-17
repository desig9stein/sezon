import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface FoundSource {
  readonly file: string;
  readonly name: string;
  readonly lang: unknown;
}

const DATA = join(process.cwd(), 'src', 'data');
const SOURCE_KEYS = new Set(['name', 'url', 'lang']);
const CYRILLIC = /[Ѐ-ӿ]/;

/** Collects every citation object (`name` and `url`, optionally `lang`) in a parsed YAML value. */
function sourcesIn(value: unknown, file: string): FoundSource[] {
  if (Array.isArray(value)) return value.flatMap((item) => sourcesIn(item, file));
  if (value === null || typeof value !== 'object' || value instanceof Date) return [];
  const record = value as Record<string, unknown>;
  const isSource =
    typeof record.name === 'string' &&
    typeof record.url === 'string' &&
    Object.keys(record).every((key) => SOURCE_KEYS.has(key));
  const own = isSource ? [{ file, name: record.name as string, lang: record.lang }] : [];
  return [...own, ...Object.values(record).flatMap((item) => sourcesIn(item, file))];
}

const SOURCES = readdirSync(DATA).flatMap((collection) =>
  readdirSync(join(DATA, collection))
    .filter((file) => file.endsWith('.yaml'))
    .flatMap((file) =>
      sourcesIn(parse(readFileSync(join(DATA, collection, file), 'utf8')), `${collection}/${file}`),
    ),
);

describe('source languages (spec 060)', () => {
  it('AC3: finds the sources in the data', () => {
    expect(SOURCES.length).toBeGreaterThan(100);
  });

  it('AC3 (QA 060): every source title without a Cyrillic letter declares a language other than bg', () => {
    const missing = SOURCES.filter(
      (source) =>
        !CYRILLIC.test(source.name) && (source.lang === undefined || source.lang === 'bg'),
    ).map((source) => `${source.file}: ${source.name}`);
    expect(missing).toEqual([]);
  });

  it('AC3: no source writes the default language bg', () => {
    const explicit = SOURCES.filter((source) => source.lang === 'bg').map(
      (source) => `${source.file}: ${source.name}`,
    );
    expect(explicit).toEqual([]);
  });
});
