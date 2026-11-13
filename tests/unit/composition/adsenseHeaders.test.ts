import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ADSENSE_CSP_SOURCES,
  adsenseHeaders,
  usesAdSense,
  withAdSenseSources,
} from '../../../src/composition/adsenseHeaders.mjs';

/** The site's CSP without AdSense, as on main before specs 045 and 046. */
const BASE_CSP =
  "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'wasm-unsafe-eval'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const PUBLIC_HEADERS = readFileSync(join(process.cwd(), 'public', '_headers'), 'utf8');

const cspOf = (headers: string) => headers.match(/Content-Security-Policy: (.*)/)?.[1] ?? '';
const directive = (csp: string, name: string) =>
  csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `)) ?? '';

const buildDir = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), 'sezon-headers-'));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return dir;
};

const runHook = async (dir: string) => {
  const hook = adsenseHeaders().hooks['astro:build:done'];
  await hook({ dir: pathToFileURL(`${dir}/`) });
};

describe('AdSense CSP at build time, QA 045 regressions', () => {
  it('QA2: the committed _headers keeps the CSP without any Google host', () => {
    expect(cspOf(PUBLIC_HEADERS)).toBe(BASE_CSP);
  });

  it('QA2: the build leaves _headers byte-identical when no page uses AdSense', async () => {
    const dir = buildDir({
      _headers: PUBLIC_HEADERS,
      'index.html': '<main><p>Без реклама</p></main>',
    });
    await runHook(dir);
    expect(readFileSync(join(dir, '_headers'), 'utf8')).toBe(PUBLIC_HEADERS);
  });

  it('QA2: the build adds the Google hosts when a page has an AdSense unit', async () => {
    const dir = buildDir({
      _headers: PUBLIC_HEADERS,
      'index.html': '<p>Без реклама</p>',
      'month.html': '<ins class="adsbygoogle" data-ad-client="ca-pub-1234567890123456"></ins>',
    });
    await runHook(dir);
    const headers = readFileSync(join(dir, '_headers'), 'utf8');
    expect(headers).toBe(withAdSenseSources(PUBLIC_HEADERS));
    expect(headers).not.toBe(PUBLIC_HEADERS);
  });

  it('QA2: detects AdSense from a unit or the privacy settings control', () => {
    expect(usesAdSense(['<p>Нищо</p>'])).toBe(false);
    expect(
      usesAdSense(['<ins class="adsbygoogle" data-ad-client="ca-pub-1234567890"></ins>']),
    ).toBe(true);
    expect(
      usesAdSense(['<div data-privacy-settings data-ad-client="ca-pub-1234567890"></div>']),
    ).toBe(true);
  });

  it.each([
    ['script-src', 'https://pagead2.googlesyndication.com'],
    ['script-src', 'https://fundingchoicesmessages.google.com'],
    ['script-src', 'https://tpc.googlesyndication.com'],
    ['script-src', 'https://ep2.adtrafficquality.google'],
    ['frame-src', 'https://googleads.g.doubleclick.net'],
    ['frame-src', 'https://*.safeframe.googlesyndication.com'],
    ['frame-src', 'https://tpc.googlesyndication.com'],
    ['frame-src', 'https://fundingchoicesmessages.google.com'],
    ['connect-src', 'https://pagead2.googlesyndication.com'],
    ['connect-src', 'https://ep1.adtrafficquality.google'],
    ['connect-src', 'https://fundingchoicesmessages.google.com'],
    ['img-src', 'https://pagead2.googlesyndication.com'],
  ])('QA3: with AdSense, %s allows %s', (name, host) => {
    const csp = cspOf(withAdSenseSources(PUBLIC_HEADERS));
    expect(directive(csp, name).split(' ')).toContain(host);
    expect(ADSENSE_CSP_SOURCES[name as keyof typeof ADSENSE_CSP_SOURCES]).toContain(host);
  });

  it('QA2: with AdSense, keeps the original sources, same-origin loads and the framing ban', () => {
    const csp = cspOf(withAdSenseSources(PUBLIC_HEADERS));
    expect(directive(csp, 'script-src')).toMatch(/^script-src 'self' 'wasm-unsafe-eval' /);
    expect(directive(csp, 'img-src')).toMatch(/^img-src 'self' data: /);
    expect(directive(csp, 'connect-src')).toMatch(/^connect-src 'self' /);
    expect(directive(csp, 'frame-src')).toMatch(/^frame-src 'self' /);
    expect(directive(csp, 'frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(directive(csp, 'script-src')).not.toMatch(/'unsafe-inline'|'unsafe-eval'/);
    expect(
      withAdSenseSources(PUBLIC_HEADERS).replace(cspOf(withAdSenseSources(PUBLIC_HEADERS)), ''),
    ).toBe(PUBLIC_HEADERS.replace(BASE_CSP, ''));
  });
});
