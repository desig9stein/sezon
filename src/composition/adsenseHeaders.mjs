// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

/**
 * Sources the AdSense tag and Google's Privacy & messaging need, per CSP directive (spec 045).
 * Added to the built `_headers` only when a page uses AdSense.
 */
export const ADSENSE_CSP_SOURCES = Object.freeze({
  'script-src': [
    'https://pagead2.googlesyndication.com',
    'https://tpc.googlesyndication.com',
    'https://ep2.adtrafficquality.google',
    'https://fundingchoicesmessages.google.com',
  ],
  'img-src': [
    'https://pagead2.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://www.google.com',
  ],
  'connect-src': [
    'https://pagead2.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://www.google.com',
    'https://ep1.adtrafficquality.google',
    'https://fundingchoicesmessages.google.com',
  ],
  'frame-src': [
    'https://googleads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
    'https://*.safeframe.googlesyndication.com',
    'https://fundingchoicesmessages.google.com',
  ],
});

/** Sources a directive starts from when the policy lacks it and falls back to `default-src 'self'`. */
const SAME_ORIGIN = "'self'";
const CSP_PREFIX = 'Content-Security-Policy: ';
const HEADERS_FILE = '_headers';
const HTML_SUFFIX = '.html';
/** Markup that only an AdSense build renders: an ad unit or the privacy settings control. */
const ADSENSE_MARKUP = /data-ad-client="ca-pub-\d+"/;

/**
 * Returns `csp` with the {@link ADSENSE_CSP_SOURCES} appended to their directives. A directive the
 * policy lacks is added after the last one and starts with `'self'`, so same-origin loads keep
 * working.
 * @param {string} csp - A Content-Security-Policy value.
 * @returns {string}
 */
function policyWithAdSense(csp) {
  const directives = csp.split(';').map((part) => part.trim());
  for (const [name, sources] of Object.entries(ADSENSE_CSP_SOURCES)) {
    const index = directives.findIndex((part) => part.startsWith(`${name} `));
    if (index === -1) {
      directives.push([name, SAME_ORIGIN, ...sources].join(' '));
    } else {
      directives[index] = [directives[index], ...sources].join(' ');
    }
  }
  return directives.join('; ');
}

/**
 * Returns the `_headers` text with the AdSense sources added to every Content-Security-Policy.
 * Other lines are unchanged.
 * @param {string} headers - The Cloudflare Pages `_headers` file.
 * @returns {string}
 */
export function withAdSenseSources(headers) {
  return headers
    .split('\n')
    .map((line) => {
      const start = line.indexOf(CSP_PREFIX);
      if (start === -1) return line;
      const valueStart = start + CSP_PREFIX.length;
      return `${line.slice(0, valueStart)}${policyWithAdSense(line.slice(valueStart))}`;
    })
    .join('\n');
}

/**
 * Returns whether any of the built pages renders AdSense markup.
 * @param {ReadonlyArray<string>} pages - The HTML of the built pages.
 * @returns {boolean}
 */
export function usesAdSense(pages) {
  return pages.some((html) => ADSENSE_MARKUP.test(html));
}

/**
 * Astro integration that widens the built `_headers` CSP for AdSense only when the build renders
 * AdSense markup (`PUBLIC_ADSENSE_CLIENT` set). Otherwise `_headers` stays as committed.
 */
export function adsenseHeaders() {
  return {
    name: 'sezon:adsense-headers',
    hooks: {
      /** @param {{ dir: URL }} options */
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        const files = await readdir(root, { recursive: true, encoding: 'utf8' });
        const pages = await Promise.all(
          files
            .filter((file) => file.endsWith(HTML_SUFFIX))
            .map((file) => readFile(fileURLToPath(new URL(file, dir)), 'utf8')),
        );
        if (!usesAdSense(pages)) return;
        const headersPath = fileURLToPath(new URL(HEADERS_FILE, dir));
        const headers = await readFile(headersPath, 'utf8');
        await writeFile(headersPath, withAdSenseSources(headers));
      },
    },
  };
}
