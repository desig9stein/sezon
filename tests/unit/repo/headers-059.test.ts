import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('feed stylesheet headers (spec 059)', () => {
  it('AC16: Cloudflare Pages serves /rss.xsl as an XSL stylesheet in UTF-8', () => {
    expect(readFileSync('public/_headers', 'utf8')).toMatch(
      /^\/rss\.xsl\n\s+Content-Type: text\/xsl; charset=utf-8$/m,
    );
  });

  it('AC16: the feed names the stylesheet', () => {
    expect(readFileSync('src/pages/rss.xml.ts', 'utf8')).toMatch(
      /stylesheet: routes\.feedStylesheet/,
    );
  });
});
