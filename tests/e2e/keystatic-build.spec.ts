import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { ADSENSE_CSP_SOURCES } from '../../src/composition/adsenseHeaders.mjs';

const DIST = join(process.cwd(), 'dist');
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.mjs', '.css', '.xml', '.txt', '.json', '']);
const SCRIPT_SRC = /script-src ([^;\n]+)/;

/** Returns the sources of the first `script-src` directive in a `_headers` file. */
const scriptSources = (headers: string): string[] =>
  (SCRIPT_SRC.exec(headers)?.[1] ?? '').trim().split(/\s+/).filter(Boolean);

/** Lists every file under `dist/`, relative to it. */
const distFiles = (): string[] =>
  readdirSync(DIST, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(DIST, join(entry.parentPath, entry.name)));

test.describe('the production build has no Keystatic admin (spec 054)', () => {
  test('AC9: no Keystatic route, asset or mention is built', () => {
    const files = distFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.filter((file) => /keystatic/i.test(file))).toEqual([]);
    const mentions = files
      .filter((file) => TEXT_EXTENSIONS.has(extname(file)))
      .filter((file) => /keystatic/i.test(readFileSync(join(DIST, file), 'utf8')));
    expect(mentions).toEqual([]);
  });

  test('AC9: no page hydrates a React island', () => {
    const islands = distFiles()
      .filter((file) => file.endsWith('.html'))
      .filter((file) => readFileSync(join(DIST, file), 'utf8').includes('<astro-island'));
    expect(islands).toEqual([]);
  });

  test('AC9: the built script-src adds no source beyond public/_headers and AdSense', () => {
    const allowed = new Set([
      ...scriptSources(readFileSync(join(process.cwd(), 'public', '_headers'), 'utf8')),
      ...ADSENSE_CSP_SOURCES['script-src'],
    ]);
    const built = scriptSources(readFileSync(join(DIST, '_headers'), 'utf8'));
    expect(built.length).toBeGreaterThan(0);
    expect(built.filter((source) => !allowed.has(source))).toEqual([]);
  });
});
